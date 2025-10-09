import React, { useEffect, useState } from "react";
import api from "../../utils/axios";

export default function FamilyMembersCard({ familyId }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/family/${familyId}`);
        const data = res.data.data;

        // Combine memberships and root members
        const membershipMembers = data.memberships.map(m => m.user);

        const rootMembers = [];
        if (data.maleRoot) rootMembers.push(data.maleRoot);
        if (data.femaleRoot) rootMembers.push(data.femaleRoot);

        // Merge unique members (avoid duplicates)
        const allMembers = [
          ...rootMembers,
          ...membershipMembers.filter(
            m => !rootMembers.some(r => r.user_id === m.user_id)
          )
        ];

        console.log(allMembers);
        setMembers(allMembers);
      } catch (err) {
        console.error("Error fetching family members:", err);
        setMessage({ type: "error", text: "Failed to fetch members" });
      } finally {
        setLoading(false);
      }
    };

    if (familyId) fetchFamily();
  }, [familyId]);

  const handleRemoveMember = async (user_id) => {
    try {
      setLoading(true);
     await api.delete(`/family/remove-member/${familyId}?user_id=${user_id}`); // ✅ query param
      setMessage({ type: "success", text: "Member removed successfully" });
      setMembers((prev) => prev.filter((m) => m.user_id !== user_id));
      setSelectedMember(null);
    } catch (err) {
      console.error("Error removing member:", err);
      const msg =
        err.response?.data?.message || "Failed to remove member. Try again.";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const isRootMember = (member) => {
    return member.user_id === selectedMember?.male_root_member || 
           member.user_id === selectedMember?.female_root_member;
  };

  if (loading) return <p className="text-center p-4">Loading members...</p>;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-purple-200 p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
        Family Members
      </h2>

      {message.text && (
        <div
          className={`text-center mb-4 px-4 py-2 rounded-lg ${
            message.type === "error"
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-green-100 text-green-700 border border-green-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {members.map((member) => {
          const isRoot = member.user_id === "55" || member.user_id === "54"; // Based on your response
          const canRemove = !isRoot;

          return (
            <div
              key={member.user_id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() =>
                setSelectedMember(
                  selectedMember?.user_id === member.user_id ? null : member
                )
              }
            >
              <img
                src={member.profilePhoto || "/default-avatar.png"}
                alt={member.fullname || member.name}
                className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-purple-500"
              />
              <p className="text-sm font-semibold">{member.fullname || member.name}</p>
              {isRoot && (
                <p className="text-xs text-purple-600 font-medium">Root Member</p>
              )}

              {selectedMember?.user_id === member.user_id && (
                <div className="mt-2 bg-gray-100 p-3 rounded-lg text-center shadow">
                  {isRoot ? (
                    <p className="text-sm text-red-600 font-medium">
                      Cannot remove root member from family
                    </p>
                  ) : (
                    <>
                      <p className="text-sm mb-2">
                        Do you want to remove this member from family?
                      </p>
                      <div className="flex justify-center gap-2">
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMember(member.user_id);
                          }}
                        >
                          Yes
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMember(null);
                          }}
                        >
                          No
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// components/family/FamilyMembersCard.jsx


// import React, { useEffect, useState } from "react";
// import api from "../../utils/axios";

// export default function FamilyMembersCard({ familyId }) {
//   const [members, setMembers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   useEffect(() => {
//     const fetchFamily = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get(`/family/${familyId}`);
//         const data = res.data.data;

//         // Combine memberships and root members
//         const membershipMembers = data.memberships.map(m => m.user);

//         const rootMembers = [];
//         if (data.maleRoot) rootMembers.push(data.maleRoot);
//         if (data.femaleRoot) rootMembers.push(data.femaleRoot);

//         // Merge unique members (avoid duplicates)
//         const allMembers = [
//           ...rootMembers,
//           ...membershipMembers.filter(
//             m => !rootMembers.some(r => r.user_id === m.user_id)
//           )
//         ];
 
//         console.log(allMembers)

//         setMembers(allMembers);
//       } catch (err) {
//         console.error("Error fetching family members:", err);
//         setMessage({ type: "error", text: "Failed to fetch members" });
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (familyId) fetchFamily();
//   }, [familyId]);

//   const handleRemoveMember = async (user_id) => {
//     try {
//       setLoading(true);
//       await api.delete(`/family/remove-member/${familyId}`, { user_id });
//       setMessage({ type: "success", text: "Member removed successfully" });
//       setMembers(prev => prev.filter(m => m.user_id !== user_id));
//       setSelectedMember(null);
//     } catch (err) {
//       console.error("Error removing member:", err);
//       const msg =
//         err.response?.data?.message || "Failed to remove member. Try again.";
//       setMessage({ type: "error", text: msg });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <p className="text-center p-4">Loading members...</p>;

//   return (
//     <div className="bg-white rounded-2xl shadow-lg border border-purple-200 p-6 max-w-2xl mx-auto">
//       <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
//         Family Members
//       </h2>

//       {message.text && (
//         <div
//           className={`text-center mb-4 px-4 py-2 rounded-lg ${
//             message.type === "error"
//               ? "bg-red-100 text-red-700 border border-red-300"
//               : "bg-green-100 text-green-700 border border-green-300"
//           }`}
//         >
//           {message.text}
//         </div>
//       )}

//       <div className="grid grid-cols-3 gap-6">
//         {members.map((member) => {
//           const isRoot =
//             member.user_id === members.find(m => m.user_id === member.user_id && (m.user_id === member.user_id)).user_id &&
//             (member.user_id === member.user_id);
//           const canRemove = ![member.user_id].includes(member.user_id && !isRoot);
//           return (
//             <div
//               key={member.user_id}
//               className="flex flex-col items-center cursor-pointer"
//               onClick={() =>
//                 setSelectedMember(
//                   selectedMember?.user_id === member.user_id ? null : member
//                 )
//               }
//             >
//               <img
//                 src={member.profilePhoto || "/default-avatar.png"}
//                 alt={member.fullname || member.name}
//                 className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-purple-500"
//               />
//               <p className="text-sm font-semibold">{member.fullname || member.name}</p>

//               {selectedMember?.user_id === member.user_id && canRemove && (
//                 <div className="mt-2 bg-gray-100 p-3 rounded-lg text-center shadow">
//                   <p className="text-sm mb-2">
//                     Do you want to remove this member from family?
//                   </p>
//                   <div className="flex justify-center gap-2">
//                     <button
//                       className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
//                       onClick={() => handleRemoveMember(member.user_id)}
//                     >
//                       Yes
//                     </button>
//                     <button
//                       className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
//                       onClick={() => setSelectedMember(null)}
//                     >
//                       No
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
