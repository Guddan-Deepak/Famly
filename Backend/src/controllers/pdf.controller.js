


import puppeteer from "puppeteer";
import { Story } from "../models/story.models.js";
import { User, Family, Membership } from "../models/index.js";


export const generateFamilyStoriesPDF = async (req, res) => {
  try {
     const userId = parseInt(req.user.user_id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in request" });
    }

    // ✅ 1. Get user details (to check gender)
    const user = await User.findByPk(userId, { attributes: ["user_id", "gender"] });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(user)
    // ✅ 2. Find the family where this user is the root member (based on gender)
    const rootFamily = await Family.findOne({
      where:
        user.gender === "male"
          ? { male_root_member: userId }
          : { female_root_member: userId },
    });

    if (!rootFamily) {
      return res.status(404).json({ error: "User is not a root member of any family" });
    }

    const familyId = Number(rootFamily.family_id);

    
    const { title, subtitle, description } = req.body; // ✅ Added new dynamic fields

    if (!familyId) return res.status(400).json({ error: "familyId is required" });

    // Data Fetching
    const family = await Family.findByPk(familyId);
    if (!family) return res.status(404).json({ error: "Family not found" });

    const rootMemberIds = [family.male_root_member, family.female_root_member].filter(Boolean);
    const rootMembers = await User.findAll({ where: { user_id: rootMemberIds } });
    
    const memberships = await Membership.findAll({ where: { family_id: familyId } });
    const memberIds = memberships.map(m => m.user_id).filter(id => !rootMemberIds.includes(id));
    const members = await User.findAll({ where: { user_id: memberIds } });

    const userMap = {};
    [...rootMembers, ...members].forEach(u => {
      userMap[u.user_id] = { name: u.fullname };
    });

    // Fetch stories
    const stories = await Story.find({ family_id: parseInt(familyId) })
      .sort({ memory_date: 1, createdAt: 1 });

    // Build HTML
    let html = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #fefefe; }
          .cover { text-align: center; padding: 50px 20px; background: #e0f7fa; border-bottom: 4px solid #00796b; }
          .cover h1 { font-size: 38px; margin-bottom: 8px; color: #004d40; }
          .cover h2 { font-size: 22px; margin-bottom: 8px; color: #00695c; }
          .cover p.desc { font-size: 15px; color: #004d40; margin: 12px 0; max-width: 700px; margin-left: auto; margin-right: auto; }
          .members { font-size: 14px; color: #004d40; margin-top: 15px; }
          .memories { padding: 20px; display: block; }
          .memory {
            border: 2px solid #00796b;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 20px;
            page-break-inside: avoid;
            background: #fff;
          }
          .memory .header { margin-bottom: 8px; }
          .username {
            font-size: 18px;
            font-weight: bold;
            color: #004d40;
          }
          .date {
            font-size: 14px;
            color: #777;
            margin-left: 6px;
          }
          .memory img {
            border-radius: 6px;
            margin-bottom: 8px;
            max-width: 100%;
            height: auto;
            object-fit: cover;
          }
          .memory.landscape img { width: 100%; }
          .memory.portrait {
            display: flex;
            flex-direction: row;
            align-items: flex-start;
          }
          .memory.portrait img {
            max-width: 40%;
            margin-right: 12px;
          }
          .memory.portrait .details {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .caption {
            font-size: 14px;
            color: #555;
            margin-top: 6px;
            text-align: justify;
          }
          .footer {
            text-align: center;
            padding: 20px;
            border-top: 2px solid #00796b;
            font-size: 12px;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="cover">
          <h1>${title || `Beautiful Memories of ${family.family_name}`}</h1>
          ${subtitle ? `<h2>${subtitle}</h2>` : ""}
          <p class="desc">${description || family.description || ""}</p>
          <p class="members">
            Root Members: 
            ${userMap[family.male_root_member]?.name || 'N/A'} (M), 
            ${userMap[family.female_root_member]?.name || 'N/A'} (F)
          </p>
          ${members.length ? `<p class="members">Other Members: ${members.map(m => m.fullname).join(', ')}</p>` : ""}
        </div>
      </div>
    `;

    // ✅ FIX 2: Added pagination logic to create new pages for long lists of memories.
    const allMediaItems = [];
    stories.forEach(story => {
        story.media.forEach(media => {
            if (media.type === 'image') {
                allMediaItems.push({
                    uploader: userMap[story.uploaded_by]?.name || "Unknown",
                    memoryDate: new Date(story.memory_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' }),
                    url: media.url,
                    text: media.text
                });
            }
        });
    });

    const itemsPerPage = 2; // Display 2 memories per page
    for (let i = 0; i < allMediaItems.length; i += itemsPerPage) {
        const pageItems = allMediaItems.slice(i, i + itemsPerPage);
        let pageHtml = '<div class="page memories-page">';
        
        pageItems.forEach(item => {
            const captionHtml = item.text ? `<p class="caption">${item.text}</p>` : '';
            pageHtml += `
              <div class="memory-card">
                <div class="header">
                  <span class="username">${item.uploader}</span>
                  <span class="date">${item.memoryDate}</span>
                </div>
                <div class="image-container">
                  <img src="${item.url}" alt="Family memory" />
                </div>
                ${captionHtml}
              </div>
            `;
        });

        pageHtml += '</div>';
        htmlContent += pageHtml;
    }


    // PDF Generation
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    const finalHtml = createHtmlDocument(htmlContent, getCssTemplate());
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-family: 'Poppins', sans-serif; font-size: 9pt; color: #a0aec0; width: 100%; text-align: center; padding-top: 0.5cm;">
          Famly — Beautiful Memories
        </div>`,
      footerTemplate: `
        <div style="font-family: 'Poppins', sans-serif; font-size: 9pt; color: #a0aec0; width: 100%; text-align: center; padding-bottom: 0.5cm;">
          Made with love for preserving precious family moments 💖
        </div>`,
      margin: { top: '1.5cm', bottom: '1.5cm', left: '0', right: '0' }
    });

    await browser.close();

    // Send Response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${family.family_name}_Memories.pdf"`,
    });
    res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF." });
  }
};