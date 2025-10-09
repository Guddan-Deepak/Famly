
// import { QueryTypes } from "sequelize";
// import { sequelize } from "../db/index.js";
// import { Membership, User, Family } from "../models/index.js";

// export async function getFamilyAncestorsAndDescendants(req, res) {
//   try {
//     const userId = parseInt(req.user.user_id);
//     if (!userId) {
//       return res.status(400).json({ error: "User not found in request" });
//     }

//     // ✅ 1. Get user details (to check gender)
//     const user = await User.findByPk(userId, { attributes: ["user_id", "gender"] });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     console.log(user)
//     // ✅ 2. Find the family where this user is the root member (based on gender)
//     const rootFamily = await Family.findOne({
//       where: 
//         user.gender === "male"
//           ? { male_root_member: userId }
//           : { female_root_member: userId },
//     });

//     if (!rootFamily) {
//       return res.status(404).json({ error: "User is not a root member of any family" });
//     }

//     const familyId = Number(rootFamily.family_id);
    
//     if (!familyId) {
//       return res.status(400).json({ error: "familyId not found" });
//     }

//     const ancestorOffset = Number(req.query.ancestorOffset ?? 0);
//     const descendantOffset = Number(req.query.descendantOffset ?? 0);

//     // 1) Ancestors query (4 at a time)
//     const ancestorQuery = `
//       WITH RECURSIVE ancestors AS (
//         SELECT f.family_id, f.family_name, f."familyPhoto", f.ancestor, 0 AS depth, ARRAY[f.family_id] AS path
//         FROM families f
//         WHERE f.family_id = :familyId

//         UNION ALL

//         SELECT f.family_id, f.family_name, f."familyPhoto", f.ancestor, a.depth + 1, a.path || f.family_id
//         FROM families f
//         JOIN ancestors a ON f.family_id = a.ancestor
//         WHERE NOT f.family_id = ANY(a.path)
//       )
//       SELECT family_id, family_name, "familyPhoto", depth
//       FROM ancestors
//       WHERE depth > 0
//       ORDER BY depth ASC
//       OFFSET :ancestorOffset * 4
//       LIMIT 4;
//     `;

//     // 2) Descendants query (4 at a time)
//     const descendantQuery = `
//       WITH RECURSIVE descendants AS (
//         SELECT f.family_id, f.family_name, f."familyPhoto", f.ancestor, 0 AS depth, ARRAY[f.family_id] AS path
//         FROM families f
//         WHERE f.family_id = :familyId

//         UNION ALL

//         SELECT f.family_id, f.family_name, f."familyPhoto", f.ancestor, d.depth - 1, d.path || f.family_id
//         FROM families f
//         JOIN descendants d ON f.ancestor = d.family_id
//         WHERE NOT f.family_id = ANY(d.path)
//       )
//       SELECT family_id, family_name, "familyPhoto", depth
//       FROM descendants
//       WHERE depth < 0
//       ORDER BY depth DESC
//       OFFSET :descendantOffset * 4
//       LIMIT 4;
//     `;

//     const ancestors = await sequelize.query(ancestorQuery, {
//       replacements: { familyId, ancestorOffset },
//       type: QueryTypes.SELECT,
//     });

//     const descendants = await sequelize.query(descendantQuery, {
//       replacements: { familyId, descendantOffset },
//       type: QueryTypes.SELECT,
//     });

//     // 3) Current family
//     const [currentFamily] = await sequelize.query(
//       `
//       SELECT f.family_id, f.family_name, f."familyPhoto", f.male_root_member, f.female_root_member, 0 AS depth
//       FROM families f
//       WHERE f.family_id = :familyId
//       `,
//       { replacements: { familyId }, type: QueryTypes.SELECT }
//     );

//     // 4) Collect all family IDs to fetch members
//     const familiesToFetch = [
//       familyId,
//       ...ancestors.map(f => f.family_id),
//       ...descendants.map(f => f.family_id),
//     ];

//     let members = [];
//     if (familiesToFetch.length > 0) {
//       members = await sequelize.query(
//         `
//         SELECT m.family_id, u.user_id, u.fullname AS name, u."profilePhoto"
//         FROM memberships m
//         JOIN users u ON u.user_id = m.user_id
//         WHERE m.family_id = ANY(ARRAY[:familyIds]::int[])
//         `,
//         { replacements: { familyIds: familiesToFetch }, type: QueryTypes.SELECT }
//       );
//     }

//     // 5) Group members by family
//     const membersByFamily = members.reduce((acc, m) => {
//       if (!acc[m.family_id]) acc[m.family_id] = [];
//       acc[m.family_id].push({ user_id: m.user_id, name: m.name, profilePhoto: m.profilePhoto });
//       return acc;
//     }, {});

//     // Helper to attach root members
//     const attachRootMembers = async family => {
//       const maleRoot =
//         family.male_root_member &&
//         members.find(m => m.user_id === family.male_root_member) || null;
//       const femaleRoot =
//         family.female_root_member &&
//         members.find(m => m.user_id === family.female_root_member) || null;

//       return {
//         ...family,
//         rootMembers: { male: maleRoot, female: femaleRoot },
//         members: membersByFamily[family.family_id] || [],
//       };
//     };

//     // 6) Attach members and rootMembers
//     const enrichedCurrentFamily = await attachRootMembers(currentFamily);
//     const enrichedAncestors = await Promise.all(
//       ancestors.map(async f => {
//         const fam = await sequelize.query(
//           `SELECT male_root_member, female_root_member FROM families WHERE family_id = :familyId`,
//           { replacements: { familyId: f.family_id }, type: QueryTypes.SELECT }
//         );
//         return attachRootMembers({ ...f, ...fam[0] });
//       })
//     );
//     const enrichedDescendants = await Promise.all(
//       descendants.map(async f => {
//         const fam = await sequelize.query(
//           `SELECT male_root_member, female_root_member FROM families WHERE family_id = :familyId`,
//           { replacements: { familyId: f.family_id }, type: QueryTypes.SELECT }
//         );
//         return attachRootMembers({ ...f, ...fam[0] });
//       })
//     );

//     return res.json({
//       currentFamily: enrichedCurrentFamily,
//       ancestors: enrichedAncestors,
//       descendants: enrichedDescendants,
//     });
//   } catch (err) {
//     console.error("Error in getFamilyAncestorsAndDescendants:", err);
//     return res.status(500).json({ error: err.message });
//   }
// }

// export async function getFamilyAncestorsAndDescendantsById(req, res) {
//   try {
    
//     const userId = parseInt(req.params.user_id);
//     if (!userId) {
//       return res.status(400).json({ error: "User not found in request" });
//     }

//     // ✅ 1. Get user details (to check gender)
//     const user = await User.findByPk(userId, { attributes: ["user_id", "gender"] });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }
//     console.log(user)
//     // ✅ 2. Find the family where this user is the root member (based on gender)
//     const rootFamily = await Family.findOne({
//       where:
//         user.gender === "male"
//           ? { male_root_member: userId }
//           : { female_root_member: userId },
//     });

//     if (!rootFamily) {
//       return res.status(404).json({ error: "User is not a root member of any family" });
//     }

//     const familyId = Number(rootFamily.family_id);
    
//     if (!familyId) {
//       return res.status(400).json({ error: "familyId not found" });
//     }

//     const ancestorOffset = Number(req.query.ancestorOffset ?? 0);
//     const descendantOffset = Number(req.query.descendantOffset ?? 0);

//     // 1) Ancestors query (4 at a time)
//     const ancestorQuery = `
//       WITH RECURSIVE ancestors AS (
//         SELECT f.family_id, f.family_name, f."familyPhoto", f.ancestor, 0 AS depth, ARRAY[f.family_id] AS path
//         FROM families f
//         WHERE f.family_id = :familyId

//         UNION ALL

//         SELECT f.family_id, f.family_name, f."familyPhoto", f.ancestor, a.depth + 1, a.path || f.family_id
//         FROM families f
//         JOIN ancestors a ON f.family_id = a.ancestor
//         WHERE NOT f.family_id = ANY(a.path)
//       )
//       SELECT family_id, family_name, "familyPhoto", depth
//       FROM ancestors
//       WHERE depth > 0
//       ORDER BY depth ASC
//       OFFSET :ancestorOffset * 4
//       LIMIT 4;
//     `;

//     // 2) Descendants query (4 at a time)
//     const descendantQuery = `
//       WITH RECURSIVE descendants AS (
//         SELECT f.family_id, f.family_name, f."familyPhoto", f.ancestor, 0 AS depth, ARRAY[f.family_id] AS path
//         FROM families f
//         WHERE f.family_id = :familyId

//         UNION ALL

//         SELECT f.family_id, f.family_name, f."familyPhoto", f.ancestor, d.depth - 1, d.path || f.family_id
//         FROM families f
//         JOIN descendants d ON f.ancestor = d.family_id
//         WHERE NOT f.family_id = ANY(d.path)
//       )
//       SELECT family_id, family_name, "familyPhoto", depth
//       FROM descendants
//       WHERE depth < 0
//       ORDER BY depth DESC
//       OFFSET :descendantOffset * 4
//       LIMIT 4;
//     `;

//     const ancestors = await sequelize.query(ancestorQuery, {
//       replacements: { familyId, ancestorOffset },
//       type: QueryTypes.SELECT,
//     });

//     const descendants = await sequelize.query(descendantQuery, {
//       replacements: { familyId, descendantOffset },
//       type: QueryTypes.SELECT,
//     });

//     // 3) Current family
//     const [currentFamily] = await sequelize.query(
//       `
//       SELECT f.family_id, f.family_name, f."familyPhoto", f.male_root_member, f.female_root_member, 0 AS depth
//       FROM families f
//       WHERE f.family_id = :familyId
//       `,
//       { replacements: { familyId }, type: QueryTypes.SELECT }
//     );

//     // 4) Collect all family IDs to fetch members
//     const familiesToFetch = [
//       familyId,
//       ...ancestors.map(f => f.family_id),
//       ...descendants.map(f => f.family_id),
//     ];

//     let members = [];
//     if (familiesToFetch.length > 0) {
//       members = await sequelize.query(
//         `
//         SELECT m.family_id, u.user_id, u.fullname AS name, u."profilePhoto"
//         FROM memberships m
//         JOIN users u ON u.user_id = m.user_id
//         WHERE m.family_id = ANY(ARRAY[:familyIds]::int[])
//         `,
//         { replacements: { familyIds: familiesToFetch }, type: QueryTypes.SELECT }
//       );
//     }

//     // 5) Group members by family
//     const membersByFamily = members.reduce((acc, m) => {
//       if (!acc[m.family_id]) acc[m.family_id] = [];
//       acc[m.family_id].push({ user_id: m.user_id, name: m.name, profilePhoto: m.profilePhoto });
//       return acc;
//     }, {});

//     // Helper to attach root members
//     const attachRootMembers = async family => {
//       const maleRoot =
//         family.male_root_member &&
//         members.find(m => m.user_id === family.male_root_member) || null;
//       const femaleRoot =
//         family.female_root_member &&
//         members.find(m => m.user_id === family.female_root_member) || null;

//       return {
//         ...family,
//         rootMembers: { male: maleRoot, female: femaleRoot },
//         members: membersByFamily[family.family_id] || [],
//       };
//     };

//     // 6) Attach members and rootMembers
//     const enrichedCurrentFamily = await attachRootMembers(currentFamily);
//     const enrichedAncestors = await Promise.all(
//       ancestors.map(async f => {
//         const fam = await sequelize.query(
//           `SELECT male_root_member, female_root_member FROM families WHERE family_id = :familyId`,
//           { replacements: { familyId: f.family_id }, type: QueryTypes.SELECT }
//         );
//         return attachRootMembers({ ...f, ...fam[0] });
//       })
//     );
//     const enrichedDescendants = await Promise.all(
//       descendants.map(async f => {
//         const fam = await sequelize.query(
//           `SELECT male_root_member, female_root_member FROM families WHERE family_id = :familyId`,
//           { replacements: { familyId: f.family_id }, type: QueryTypes.SELECT }
//         );
//         return attachRootMembers({ ...f, ...fam[0] });
//       })
//     );

//     return res.json({
//       currentFamily: enrichedCurrentFamily,
//       ancestors: enrichedAncestors,
//       descendants: enrichedDescendants,
//     });
//   } catch (err) {
//     console.error("Error in getFamilyAncestorsAndDescendants:", err);
//     return res.status(500).json({ error: err.message });
//   }
// }
import { QueryTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import { User, Family,Membership } from "../models/index.js";



// export async function getFamilyAncestorsAndDescendants(req, res) {
//   try {
//     const userId = parseInt(req.user.user_id);
//     if (!userId) {
//       return res.status(400).json({ error: "User not found in request" });
//     }

//     // Get user details
//     const user = await User.findByPk(userId, { 
//       attributes: ["user_id", "gender", "fullname", "profilePhoto"] 
//     });
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Find the root family for this user
//     const rootFamily = await Family.findOne({
//       where: user.gender === "male" 
//         ? { male_root_member: userId } 
//         : { female_root_member: userId }
//     });

//     if (!rootFamily) {
//       return res.status(404).json({ error: "User is not a root member of any family" });
//     }

//     const rootFamilyId = rootFamily.family_id;

//     // FIXED: Proper ancestor query that actually works
//     const ancestorQuery = `
//       WITH RECURSIVE ancestors AS (
//         -- Base case: start from the parent of current family
//         SELECT 
//           f.family_id,
//           f.family_name,
//           f."familyPhoto",
//           f.male_root_member,
//           f.female_root_member,
//           f.ancestor as parent_family_id,
//           1 as depth,  -- Start from 1 (parent)
//           ARRAY[f.family_id] as path
//         FROM families f
//         WHERE f.family_id = (
//           SELECT ancestor FROM families WHERE family_id = :rootFamilyId
//         )

//         UNION ALL

//         -- Recursive case: keep going up the ancestor chain
//         SELECT 
//           parent.family_id,
//           parent.family_name,
//           parent."familyPhoto",
//           parent.male_root_member,
//           parent.female_root_member,
//           parent.ancestor as parent_family_id,
//           a.depth + 1 as depth,
//           a.path || parent.family_id
//         FROM families parent
//         INNER JOIN ancestors a ON parent.family_id = a.parent_family_id
//         WHERE a.parent_family_id IS NOT NULL 
//           AND NOT parent.family_id = ANY(a.path)
//           AND array_length(a.path, 1) < 10  -- Safety limit
//       )
//       SELECT 
//         family_id,
//         family_name,
//         "familyPhoto",
//         male_root_member,
//         female_root_member,
//         parent_family_id,
//         -depth as level,  -- Negative levels for ancestors
//         path,
//         'ancestor' as direction
//       FROM ancestors
//       ORDER BY level;
//     `;

//     // Descendant query (this part works fine)
//     const descendantQuery = `
//       WITH RECURSIVE descendants AS (
//         SELECT 
//           f.family_id,
//           f.family_name,
//           f."familyPhoto",
//           f.male_root_member,
//           f.female_root_member,
//           f.ancestor as parent_family_id,
//           0 as level,
//           ARRAY[f.family_id] as path
//         FROM families f
//         WHERE f.family_id = :rootFamilyId

//         UNION ALL

//         SELECT 
//           child.family_id,
//           child.family_name,
//           child."familyPhoto",
//           child.male_root_member,
//           child.female_root_member,
//           child.ancestor as parent_family_id,
//           d.level + 1 as level,
//           d.path || child.family_id
//         FROM families child
//         INNER JOIN descendants d ON child.ancestor = d.family_id
//         WHERE NOT child.family_id = ANY(d.path)
//           AND array_length(d.path, 1) < 10
//       )
//       SELECT *, 'descendant' as direction 
//       FROM descendants 
//       WHERE level > 0
//       ORDER BY level;
//     `;

//     // Root family query
//     const rootFamilyQuery = `
//       SELECT 
//         family_id, family_name, "familyPhoto", 
//         male_root_member, female_root_member,
//         ancestor as parent_family_id,
//         0 as level,
//         ARRAY[family_id] as path,
//         'root' as direction
//       FROM families 
//       WHERE family_id = :rootFamilyId
//     `;

//     // Execute all queries
//     const [rootFamilyData] = await sequelize.query(rootFamilyQuery, {
//       replacements: { rootFamilyId },
//       type: QueryTypes.SELECT,
//     });

//     const ancestors = await sequelize.query(ancestorQuery, {
//       replacements: { rootFamilyId },
//       type: QueryTypes.SELECT,
//     });

//     const descendants = await sequelize.query(descendantQuery, {
//       replacements: { rootFamilyId },
//       type: QueryTypes.SELECT,
//     });

//     console.log('=== DEBUG INFO ===');
//     console.log('Root Family ID:', rootFamilyId);
//     console.log('Root Family Parent ID:', rootFamilyData?.parent_family_id);
//     console.log('Ancestors found:', ancestors.length);
//     console.log('Descendants found:', descendants.length);
//     ancestors.forEach(ancestor => {
//       console.log(`- Ancestor: ${ancestor.family_name} (ID: ${ancestor.family_id}, Level: ${ancestor.level})`);
//     });

//     // Combine all families
//     const allFamilies = [rootFamilyData, ...ancestors, ...descendants];

//     if (allFamilies.length === 0) {
//       return res.json({ 
//         tree: null,
//         currentUser: {
//           user_id: user.user_id,
//           fullname: user.fullname,
//           profilePhoto: user.profilePhoto,
//           gender: user.gender
//         }
//       });
//     }

//     // Get all family IDs to fetch members
//     const familyIds = allFamilies.map(f => f.family_id);
    
//     // Fetch all members for these families
//     const members = await sequelize.query(
//       `
//       SELECT 
//         m.family_id, 
//         u.user_id, 
//         u.fullname, 
//         u."profilePhoto",
//         u.gender
//       FROM memberships m
//       JOIN users u ON u.user_id = m.user_id
//       WHERE m.family_id = ANY(ARRAY[:familyIds]::int[])
//       ORDER BY m.family_id, u.user_id
//       `,
//       { replacements: { familyIds }, type: QueryTypes.SELECT }
//     );

//     // Group members by family_id
//     const membersByFamily = members.reduce((acc, member) => {
//       if (!acc[member.family_id]) {
//         acc[member.family_id] = [];
//       }
//       acc[member.family_id].push({
//         user_id: member.user_id,
//         fullname: member.fullname,
//         profilePhoto: member.profilePhoto,
//         gender: member.gender
//       });
//       return acc;
//     }, {});

//     // Build hierarchical tree structure
//     const familyMap = new Map();
//     let rootNode = null;

//     // First pass: create all nodes
//     allFamilies.forEach(family => {
//       const familyMembers = membersByFamily[family.family_id] || [];
      
//       const maleRootMember = family.male_root_member ? 
//         familyMembers.find(m => m.user_id === family.male_root_member) : null;
//       const femaleRootMember = family.female_root_member ? 
//         familyMembers.find(m => m.user_id === family.female_root_member) : null;

//       const node = {
//         family_id: family.family_id,
//         family_name: family.family_name,
//         familyPhoto: family.familyPhoto,
//         level: family.level,
//         direction: family.direction,
//         parent_family_id: family.parent_family_id,
//         members: familyMembers,
//         rootMembers: {
//           male: maleRootMember,
//           female: femaleRootMember
//         },
//         children: []
//       };

//       familyMap.set(family.family_id, node);

//       if (family.level === 0) {
//         rootNode = node;
//       }
//     });

//     // Second pass: build parent-child relationships
//     allFamilies.forEach(family => {
//       if (family.parent_family_id !== null && family.parent_family_id !== undefined) {
//         const parentNode = familyMap.get(family.parent_family_id);
//         const childNode = familyMap.get(family.family_id);
//         if (parentNode && childNode) {
//           parentNode.children.push(childNode);
//         }
//       }
//     });

//     // FIXED: Also add ancestors as children of the root for the tree structure
//     // This ensures ancestors appear in the extracted nodes
//     ancestors.forEach(ancestor => {
//       const ancestorNode = familyMap.get(ancestor.family_id);
//       if (ancestorNode && rootNode) {
//         // Add ancestor as a child of root so it appears in the tree
//         // This is just for the frontend to extract it
//         rootNode.children.push(ancestorNode);
//       }
//     });

//     console.log('=== FINAL TREE STRUCTURE ===');
//     console.log('Root children count:', rootNode?.children?.length);
//     console.log('Root children:', rootNode?.children?.map(c => `${c.family_name} (${c.direction})`));

//     res.json({
//       tree: rootNode,
//       currentUser: {
//         user_id: user.user_id,
//         fullname: user.fullname,
//         profilePhoto: user.profilePhoto,
//         gender: user.gender
//       }
//     });

//   } catch (err) {
//     console.error("Error in getFamilyAncestorsAndDescendants:", err);
//     return res.status(500).json({ error: err.message });
//   }
// }
export async function getFamilyAncestorsAndDescendants(req, res) {
  try {
    const userId = parseInt(req.user.user_id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in request" });
    }

    // Get user details
    const user = await User.findByPk(userId, { 
      attributes: ["user_id", "gender", "fullname", "profilePhoto"] 
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find ANY family where this user is a member
    const userMembership = await Membership.findOne({
      where: { user_id: userId },
      include: [{
        model: Family,
        as: 'family'
      }]
    });

    if (!userMembership) {
      return res.status(404).json({ error: "User is not a member of any family" });
    }

    const rootFamilyId = userMembership.family.family_id;

    // SEPARATE QUERIES for ancestors and descendants

    // 1. ANCESTORS QUERY (Parents, Grandparents, etc.)
    const ancestorsQuery = `
      WITH RECURSIVE ancestors AS (
        SELECT 
          f.family_id,
          f.family_name,
          f."familyPhoto",
          f.male_root_member,
          f.female_root_member,
          f.ancestor as parent_family_id,
          1 as depth,
          ARRAY[f.family_id] as path
        FROM families f
        WHERE f.family_id = (
          SELECT ancestor FROM families WHERE family_id = :rootFamilyId AND ancestor IS NOT NULL
        )

        UNION ALL

        SELECT 
          parent.family_id,
          parent.family_name,
          parent."familyPhoto",
          parent.male_root_member,
          parent.female_root_member,
          parent.ancestor as parent_family_id,
          a.depth + 1 as depth,
          a.path || parent.family_id
        FROM families parent
        INNER JOIN ancestors a ON parent.family_id = a.parent_family_id
        WHERE a.parent_family_id IS NOT NULL 
          AND array_length(a.path, 1) < 5
      )
      SELECT 
        family_id,
        family_name,
        "familyPhoto",
        male_root_member,
        female_root_member,
        parent_family_id,
        -depth as depth,
        'ancestor' as type
      FROM ancestors
      ORDER BY depth;
    `;

    // 2. DESCENDANTS QUERY (Children, Grandchildren, etc.)
    const descendantsQuery = `
      WITH RECURSIVE descendants AS (
        SELECT 
          f.family_id,
          f.family_name,
          f."familyPhoto",
          f.male_root_member,
          f.female_root_member,
          f.ancestor as parent_family_id,
          1 as depth,
          ARRAY[f.family_id] as path
        FROM families f
        WHERE f.ancestor = :rootFamilyId

        UNION ALL

        SELECT 
          child.family_id,
          child.family_name,
          child."familyPhoto",
          child.male_root_member,
          child.female_root_member,
          child.ancestor as parent_family_id,
          d.depth + 1 as depth,
          d.path || child.family_id
        FROM families child
        INNER JOIN descendants d ON child.ancestor = d.family_id
        WHERE NOT child.family_id = ANY(d.path)
          AND array_length(d.path, 1) < 5
      )
      SELECT 
        family_id,
        family_name,
        "familyPhoto",
        male_root_member,
        female_root_member,
        parent_family_id,
        depth,
        'descendant' as type
      FROM descendants
      ORDER BY depth;
    `;

    // 3. CURRENT FAMILY QUERY
    const currentFamilyQuery = `
      SELECT 
        family_id, 
        family_name, 
        "familyPhoto", 
        male_root_member, 
        female_root_member,
        ancestor as parent_family_id,
        0 as depth,
        'current' as type
      FROM families 
      WHERE family_id = :rootFamilyId
    `;

    // Execute all queries
    const [currentFamilyData] = await sequelize.query(currentFamilyQuery, {
      replacements: { rootFamilyId },
      type: QueryTypes.SELECT,
    });

    const ancestors = await sequelize.query(ancestorsQuery, {
      replacements: { rootFamilyId },
      type: QueryTypes.SELECT,
    });

    const descendants = await sequelize.query(descendantsQuery, {
      replacements: { rootFamilyId },
      type: QueryTypes.SELECT,
    });

    console.log('=== QUERY RESULTS ===');
    console.log('Current Family:', currentFamilyData?.family_name);
    console.log('Ancestors found:', ancestors.length);
    console.log('Descendants found:', descendants.length);
    
    if (descendants.length > 0) {
      console.log('Descendant families:');
      descendants.forEach(desc => {
        console.log(`- ${desc.family_name} (Depth: ${desc.depth}, Parent: ${desc.parent_family_id})`);
      });
    }

    // Get ALL family IDs (current + ancestors + descendants)
    const allFamilyIds = [
      rootFamilyId,
      ...ancestors.map(a => a.family_id),
      ...descendants.map(d => d.family_id)
    ].filter((id, index, array) => id !== null && array.indexOf(id) === index);

    console.log('All family IDs to fetch members:', allFamilyIds);

    // Fetch all members for these families
    let members = [];
    if (allFamilyIds.length > 0) {
      members = await sequelize.query(
        `
        SELECT 
          m.family_id, 
          u.user_id, 
          u.fullname, 
          u."profilePhoto",
          u.gender
        FROM memberships m
        JOIN users u ON u.user_id = m.user_id
        WHERE m.family_id = ANY(ARRAY[:familyIds]::int[])
        ORDER BY m.family_id, u.user_id
        `,
        { replacements: { familyIds: allFamilyIds }, type: QueryTypes.SELECT }
      );
    }

    // Group members by family_id
    const membersByFamily = members.reduce((acc, member) => {
      if (!acc[member.family_id]) {
        acc[member.family_id] = [];
      }
      acc[member.family_id].push({
        user_id: member.user_id,
        name: member.fullname,
        profilePhoto: member.profilePhoto,
        gender: member.gender
      });
      return acc;
    }, {});

    // Helper function to format family data
    const formatFamilyData = (family) => {
      const familyMembers = membersByFamily[family.family_id] || [];
      
      const maleRootMember = family.male_root_member ? 
        familyMembers.find(m => m.user_id === family.male_root_member) : null;
      const femaleRootMember = family.female_root_member ? 
        familyMembers.find(m => m.user_id === family.female_root_member) : null;

      // Filter out root members from regular members
      const regularMembers = familyMembers.filter(member => 
        member.user_id !== family.male_root_member && 
        member.user_id !== family.female_root_member
      );

      return {
        family_id: family.family_id,
        family_name: family.family_name,
        familyPhoto: family.familyPhoto,
        depth: family.depth,
        type: family.type,
        parent_family_id: family.parent_family_id,
        rootMembers: {
          male: maleRootMember,
          female: femaleRootMember
        },
        members: regularMembers,
        children: []  // Initialize children array for tree building
      };
    };

    // Build hierarchical tree structure for descendants only
    const familyMap = new Map();
    
    // Add current family to map
    const currentFamilyNode = formatFamilyData(currentFamilyData);
    familyMap.set(currentFamilyNode.family_id, currentFamilyNode);

    // Add all descendants to map
    descendants.forEach(descendant => {
      const descendantNode = formatFamilyData(descendant);
      familyMap.set(descendantNode.family_id, descendantNode);
    });

    // Build parent-child relationships for descendants
    [...descendants, currentFamilyData].forEach(family => {
      if (family.parent_family_id && familyMap.has(family.parent_family_id)) {
        const parentNode = familyMap.get(family.parent_family_id);
        const childNode = familyMap.get(family.family_id);
        if (parentNode && childNode && parentNode.family_id !== childNode.family_id) {
          parentNode.children.push(childNode);
        }
      }
    });

    // Format ancestors (they remain as flat array)
    const ancestorNodes = ancestors.map(ancestor => formatFamilyData(ancestor));

    console.log('=== FINAL TREE STRUCTURE ===');
    console.log('Root Family:', currentFamilyNode.family_name);
    console.log('Root Children:', currentFamilyNode.children.length);
    
    // Log the tree structure for debugging
    const logTree = (node, level = 0) => {
      const indent = '  '.repeat(level);
      console.log(`${indent}${node.family_name} (${node.children.length} children)`);
      node.children.forEach(child => logTree(child, level + 1));
    };
    
    logTree(currentFamilyNode);

    // Return response
    res.json({
      tree: currentFamilyNode,  // This has nested children structure for descendants
      ancestors: ancestorNodes, // This remains flat array
      descendants: descendants.map(d => formatFamilyData(d)), // Flat list for grid display
      currentUser: {
        user_id: user.user_id,
        name: user.fullname,
        profilePhoto: user.profilePhoto,
        gender: user.gender
      }
    });

  } catch (err) {
    console.error("Error in getFamilyAncestorsAndDescendants:", err);
    return res.status(500).json({ error: err.message });
  }
}




export async function getFamilyAncestorsAndDescendantsById(req, res) {
  try {
    const userId = parseInt(req.params.user_id);
    if (!userId) {
      return res.status(400).json({ error: "User not found in request" });
    }

    // Get user details
    const user = await User.findByPk(userId, { 
      attributes: ["user_id", "gender", "fullname", "profilePhoto"] 
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the root family for this user
    const rootFamily = await Family.findOne({
      where: user.gender === "male" 
        ? { male_root_member: userId } 
        : { female_root_member: userId }
    });

    if (!rootFamily) {
      return res.status(404).json({ error: "User is not a root member of any family" });
    }

    const rootFamilyId = rootFamily.family_id;

    // Use the same corrected query structure as above
    const ancestorQuery = `
      WITH RECURSIVE ancestors AS (
        SELECT 
          f.family_id,
          f.family_name,
          f."familyPhoto",
          f.male_root_member,
          f.female_root_member,
          f.ancestor as parent_family_id,
          -1 as level,
          ARRAY[f.family_id] as path
        FROM families f
        WHERE f.family_id = (
          SELECT ancestor FROM families WHERE family_id = :rootFamilyId
        )

        UNION ALL

        SELECT 
          f.family_id,
          f.family_name,
          f."familyPhoto",
          f.male_root_member,
          f.female_root_member,
          f.ancestor as parent_family_id,
          a.level - 1 as level,
          a.path || f.family_id
        FROM families f
        INNER JOIN ancestors a ON f.family_id = a.parent_family_id
        WHERE a.parent_family_id IS NOT NULL 
          AND NOT f.family_id = ANY(a.path)
          AND array_length(a.path, 1) < 10
      )
      SELECT *, 'ancestor' as direction FROM ancestors
      ORDER BY level;
    `;

    const descendantQuery = `
      WITH RECURSIVE descendants AS (
        SELECT 
          f.family_id,
          f.family_name,
          f."familyPhoto",
          f.male_root_member,
          f.female_root_member,
          f.ancestor as parent_family_id,
          1 as level,
          ARRAY[f.family_id] as path
        FROM families f
        WHERE f.ancestor = :rootFamilyId

        UNION ALL

        SELECT 
          f.family_id,
          f.family_name,
          f."familyPhoto",
          f.male_root_member,
          f.female_root_member,
          f.ancestor as parent_family_id,
          d.level + 1 as level,
          d.path || f.family_id
        FROM families f
        INNER JOIN descendants d ON f.ancestor = d.family_id
        WHERE NOT f.family_id = ANY(d.path)
          AND array_length(d.path, 1) < 10
      )
      SELECT *, 'descendant' as direction FROM descendants
      ORDER BY level;
    `;

    const rootFamilyQuery = `
      SELECT 
        family_id, family_name, "familyPhoto", 
        male_root_member, female_root_member,
        ancestor as parent_family_id,
        0 as level,
        ARRAY[family_id] as path,
        'root' as direction
      FROM families 
      WHERE family_id = :rootFamilyId
    `;

    const [rootFamilyData] = await sequelize.query(rootFamilyQuery, {
      replacements: { rootFamilyId },
      type: QueryTypes.SELECT,
    });

    const ancestors = await sequelize.query(ancestorQuery, {
      replacements: { rootFamilyId },
      type: QueryTypes.SELECT,
    });

    const descendants = await sequelize.query(descendantQuery, {
      replacements: { rootFamilyId },
      type: QueryTypes.SELECT,
    });

    const allFamilies = [rootFamilyData, ...ancestors, ...descendants];

    if (allFamilies.length === 0) {
      return res.json({ 
        tree: null,
        currentUser: {
          user_id: user.user_id,
          fullname: user.fullname,
          profilePhoto: user.profilePhoto,
          gender: user.gender
        }
      });
    }

    const familyIds = allFamilies.map(f => f.family_id);
    
    const members = await sequelize.query(
      `
      SELECT 
        m.family_id, 
        u.user_id, 
        u.fullname, 
        u."profilePhoto",
        u.gender
      FROM memberships m
      JOIN users u ON u.user_id = m.user_id
      WHERE m.family_id = ANY(ARRAY[:familyIds]::int[])
      ORDER BY m.family_id, u.user_id
      `,
      { replacements: { familyIds }, type: QueryTypes.SELECT }
    );

    const membersByFamily = members.reduce((acc, member) => {
      if (!acc[member.family_id]) {
        acc[member.family_id] = [];
      }
      acc[member.family_id].push({
        user_id: member.user_id,
        fullname: member.fullname,
        profilePhoto: member.profilePhoto,
        gender: member.gender
      });
      return acc;
    }, {});

    const familyMap = new Map();
    let rootNode = null;

    allFamilies.forEach(family => {
      const familyMembers = membersByFamily[family.family_id] || [];
      
      const maleRootMember = family.male_root_member ? 
        familyMembers.find(m => m.user_id === family.male_root_member) : null;
      const femaleRootMember = family.female_root_member ? 
        familyMembers.find(m => m.user_id === family.female_root_member) : null;

      const node = {
        family_id: family.family_id,
        family_name: family.family_name,
        familyPhoto: family.familyPhoto,
        level: family.level,
        direction: family.direction,
        parent_family_id: family.parent_family_id,
        members: familyMembers,
        rootMembers: {
          male: maleRootMember,
          female: femaleRootMember
        },
        children: []
      };

      familyMap.set(family.family_id, node);

      if (family.level === 0) {
        rootNode = node;
      }
    });

    allFamilies.forEach(family => {
      if (family.parent_family_id !== null && family.parent_family_id !== undefined) {
        const parentNode = familyMap.get(family.parent_family_id);
        const childNode = familyMap.get(family.family_id);
        if (parentNode && childNode) {
          parentNode.children.push(childNode);
        }
      }
    });

    res.json({
      tree: rootNode,
      currentUser: {
        user_id: user.user_id,
        fullname: user.fullname,
        profilePhoto: user.profilePhoto,
        gender: user.gender
      }
    });

  } catch (err) {
    console.error("Error in getFamilyAncestorsAndDescendantsById:", err);
    return res.status(500).json({ error: err.message });
  }
}