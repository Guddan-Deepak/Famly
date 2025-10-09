// import React, { useEffect, useState, useCallback } from "react";
// import { motion } from "framer-motion";
// import api from "../../utils/axios";

// // ====================================================================
// // FamilyNode Component: Renders a single family node
// // ====================================================================
// const FamilyNode = ({ node, onNodeClick, isRoot = false }) => {
//   const [isExpanded, setIsExpanded] = useState(true);

//   const getNodeType = () => {
//     if (isRoot) return 'root';
//     if (node.level < 0) return 'ancestor';
//     if (node.level > 0) return 'descendant';
//     return 'current';
//   };

//   const nodeType = getNodeType();
  
//   const nodeStyles = {
//     root: 'bg-purple-100 border-purple-500 shadow-lg',
//     ancestor: 'bg-yellow-100 border-yellow-500',
//     descendant: 'bg-green-100 border-green-500',
//     current: 'bg-blue-100 border-blue-500'
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.3 }}
//         className={`flex flex-col items-center p-4 m-2 rounded-lg border-2 min-w-[180px] ${
//           nodeStyles[nodeType]
//         } shadow-md hover:shadow-lg transition-all cursor-pointer`}
//         onClick={() => onNodeClick?.(node)}
//       >
//         <div className={`w-20 h-20 rounded-full flex items-center justify-center 
//           mb-3 border-2 ${
//             nodeType === 'root' ? 'bg-purple-500 border-purple-300' :
//             nodeType === 'ancestor' ? 'bg-yellow-500 border-yellow-300' :
//             nodeType === 'descendant' ? 'bg-green-500 border-green-300' :
//             'bg-blue-500 border-blue-300'
//           } text-white font-bold text-xl`}>
//           {node.familyPhoto ? (
//             <img
//               src={node.familyPhoto}
//               alt={node.family_name}
//               className="w-full h-full object-cover rounded-full"
//             />
//           ) : (
//             node.family_name.charAt(0).toUpperCase()
//           )}
//         </div>

//         <h3 className={`font-bold text-center text-sm mb-1 ${
//           nodeType === 'root' ? 'text-purple-800' :
//           nodeType === 'ancestor' ? 'text-yellow-800' :
//           nodeType === 'descendant' ? 'text-green-800' :
//           'text-blue-800'
//         }`}>
//           {node.family_name}
//         </h3>

//         <p className="text-xs text-gray-600 mb-2 font-medium">
//           {nodeType === 'root' ? 'Your Family' : 
//            nodeType === 'ancestor' ? `Ancestor (Gen ${Math.abs(node.level)})` :
//            `Descendant (Gen ${node.level})`}
//         </p>

//         <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
//           <span className="bg-white px-2 py-1 rounded-full border">
//             👥 {node.members?.length || 0} members
//           </span>
//         </div>

//         <div className="flex flex-col gap-1 w-full">
//           {node.rootMembers?.male && (
//             <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded text-center">
//               ♂ {node.rootMembers.male.fullname}
//             </div>
//           )}
//           {node.rootMembers?.female && (
//             <div className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded text-center">
//               ♀ {node.rootMembers.female.fullname}
//             </div>
//           )}
//         </div>

//         {node.children && node.children.length > 0 && (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setIsExpanded(!isExpanded);
//             }}
//             className="mt-3 text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full transition-colors font-medium"
//           >
//             {isExpanded ? '▲ Collapse' : '▼ Expand'} ({node.children.length})
//           </button>
//         )}
//       </motion.div>

//       {/* Children Nodes */}
//       {isExpanded && node.children && node.children.length > 0 && (
//         <div className="flex flex-wrap justify-center gap-8 mt-6 relative">
//           <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-gray-400 transform -translate-x-1/2"></div>
//           <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-400 transform -translate-x-1/2"></div>
          
//           {node.children.map((childNode, index) => (
//             <div key={childNode.family_id} className="flex flex-col items-center relative">
//               <div className="absolute top-0 w-24 h-0.5 bg-gray-400 -translate-y-6"></div>
//               <FamilyNode 
//                 node={childNode} 
//                 onNodeClick={onNodeClick}
//               />
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // ====================================================================
// // AncestorsLine Component: Displays ancestors ABOVE the root family
// // ====================================================================
// const AncestorsLine = ({ ancestors, onNodeClick }) => {
//   if (!ancestors || ancestors.length === 0) {
//     return (
//       <div className="text-center mb-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
//         <p className="text-yellow-700">No ancestors found in your family tree.</p>
//       </div>
//     );
//   }

//   // Sort ancestors by level (most distant first -> -3, -2, -1)
//   const sortedAncestors = [...ancestors].sort((a, b) => a.level - b.level);

//   return (
//     <div className="flex flex-col items-center mb-8">
//       <h3 className="text-xl font-bold text-yellow-700 mb-6 bg-yellow-100 px-6 py-3 rounded-full border border-yellow-300">
//         🏛️ Family Ancestors
//       </h3>
//       <div className="flex flex-col items-center gap-6 w-full">
//         {sortedAncestors.map((ancestor, index) => (
//           <motion.div
//             key={ancestor.family_id}
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//             className="flex flex-col items-center relative"
//           >
//             {/* Connecting line between ancestors */}
//             {index > 0 && (
//               <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-yellow-400 transform -translate-x-1/2"></div>
//             )}
            
//             <div 
//               className="flex flex-col items-center p-4 rounded-lg border-2 bg-yellow-100 border-yellow-500 min-w-[200px] shadow-md hover:shadow-lg transition-all cursor-pointer z-10"
//               onClick={() => onNodeClick(ancestor)}
//             >
//               <div className="w-16 h-16 rounded-full flex items-center justify-center bg-yellow-500 border-2 border-yellow-300 text-white font-bold mb-3">
//                 {ancestor.familyPhoto ? (
//                   <img
//                     src={ancestor.familyPhoto}
//                     alt={ancestor.family_name}
//                     className="w-full h-full object-cover rounded-full"
//                   />
//                 ) : (
//                   ancestor.family_name.charAt(0).toUpperCase()
//                 )}
//               </div>

//               <h4 className="font-bold text-center text-yellow-800 mb-1">
//                 {ancestor.family_name}
//               </h4>

//               <div className="text-xs bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full mb-2 font-semibold">
//                 {ancestor.level === -1 ? 'Parent' : 
//                  ancestor.level === -2 ? 'Grandparent' :
//                  ancestor.level === -3 ? 'Great-Grandparent' :
//                  `Generation ${Math.abs(ancestor.level)}`}
//               </div>

//               <div className="text-xs bg-white px-2 py-1 rounded-full border text-yellow-700">
//                 👥 {ancestor.members?.length || 0} members
//               </div>
//             </div>

//             {/* Generation arrow */}
//             {index < sortedAncestors.length - 1 && (
//               <div className="mt-2 text-yellow-500 text-xl">↓</div>
//             )}
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ====================================================================
// // MembersList Component
// // ====================================================================
// const MembersList = ({ members, familyName, onClose }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
//       onClick={onClose}
//     >
//       <div 
//         className="bg-white rounded-xl p-6 max-w-md w-full max-h-96 overflow-y-auto shadow-2xl"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center mb-4 pb-3 border-b">
//           <h3 className="text-xl font-bold text-gray-800">Members of {familyName}</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
//           >
//             ×
//           </button>
//         </div>
        
//         <div className="space-y-3">
//           {!members || members.length === 0 ? (
//             <p className="text-gray-500 text-center py-4">No members in this family</p>
//           ) : (
//             members.map((member) => (
//               <div key={member.user_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                 {member.profilePhoto ? (
//                   <img
//                     src={member.profilePhoto}
//                     alt={member.fullname}
//                     className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
//                   />
//                 ) : (
//                   <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
//                     {member.fullname.charAt(0)}
//                   </div>
//                 )}
//                 <div className="flex-1">
//                   <p className="font-semibold text-gray-800">{member.fullname}</p>
//                   <p className="text-xs text-gray-600 capitalize flex items-center gap-1">
//                     <span>{member.gender === 'male' ? '♂' : '♀'}</span>
//                     {member.gender}
//                   </p>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// // ====================================================================
// // DebugTree Component: To see the actual data structure
// // ====================================================================
// const DebugTree = ({ tree, ancestors }) => {
//   const [showDebug, setShowDebug] = useState(false);

//   if (!showDebug) {
//     return (
//       <button
//         onClick={() => setShowDebug(true)}
//         className="fixed bottom-4 right-4 bg-gray-600 text-white px-3 py-1 rounded text-xs"
//       >
//         Debug
//       </button>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-90 text-white p-4 overflow-auto z-50">
//       <button
//         onClick={() => setShowDebug(false)}
//         className="absolute top-4 right-4 text-2xl"
//       >
//         ×
//       </button>
//       <h3 className="text-xl mb-4">Tree Debug Data</h3>
//       <div className="mb-4">
//         <h4 className="text-lg mb-2">Main Tree:</h4>
//         <pre>{JSON.stringify(tree, null, 2)}</pre>
//       </div>
//       <div>
//         <h4 className="text-lg mb-2">Ancestors Array:</h4>
//         <pre>{JSON.stringify(ancestors, null, 2)}</pre>
//       </div>
//     </div>
//   );
// };

// // ====================================================================
// // Main FamilyTree Component - UPDATED for new backend structure
// // ====================================================================
// const FamilyTree = () => {
//   const [treeData, setTreeData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [selectedFamily, setSelectedFamily] = useState(null);

//   const fetchFamilyTree = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     setSelectedFamily(null);

//     try {
//       const response = await api.get('/family/tree');
//       console.log('Full API Response:', response.data);
//       setTreeData(response.data);
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || err.message;
      
//       if (errorMessage.includes("User is not a root member of any family")) {
//         setError("NO_FAMILY_ROOT_ERROR");
//       } else {
//         setError("❌ Error fetching family tree: " + errorMessage);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchFamilyTree();
//   }, [fetchFamilyTree]);

//   const handleNodeClick = (node) => {
//     setSelectedFamily(node);
//   };

//   const handleCloseMembers = () => {
//     setSelectedFamily(null);
//   };

//   // NEW: Use the separate ancestors array from the backend
//   const ancestors = treeData?.ancestors || [];

//   // Extract descendants count from the main tree
//   const extractDescendantsCount = (node) => {
//     if (!node || !node.children) return 0;
    
//     let count = node.children.length;
//     node.children.forEach(child => {
//       count += extractDescendantsCount(child);
//     });
//     return count;
//   };

//   const descendantsCount = treeData?.tree ? extractDescendantsCount(treeData.tree) : 0;

//   console.log('Ancestors from API:', ancestors);
//   console.log('Descendants count:', descendantsCount);

//   // Loading and Error states
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <h2 className="text-xl font-semibold text-purple-600">Loading Your Family Tree...</h2>
//         </div>
//       </div>
//     );
//   }

//   if (error === "NO_FAMILY_ROOT_ERROR") {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-center">
//         <div className="bg-white rounded-2xl p-8 max-w-md shadow-lg border">
//           <div className="text-6xl mb-6">🌳</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">Start Your Family Legacy</h2>
//           <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-md hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg">
//             🌟 Create Your Family
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-center">
//         <div className="bg-white rounded-xl p-8 max-w-md shadow-lg border">
//           <div className="text-red-500 text-6xl mb-4">⚠️</div>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={fetchFamilyTree}
//             className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
//           >
//             🔄 Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!treeData?.tree) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
//         <div className="text-center bg-white p-8 rounded-xl shadow-lg border">
//           <p className="text-lg text-gray-600">No family data available yet.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
//       <div className="max-w-6xl mx-auto">
        
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">Family Tree</h1>
//           <p className="text-gray-600">
//             Exploring the legacy of <strong>{treeData.currentUser?.fullname || 'your family'}</strong>
//           </p>
//         </div>

//         {/* Ancestors Section - Now using the separate ancestors array */}
//         <AncestorsLine 
//           ancestors={ancestors} 
//           onNodeClick={handleNodeClick}
//         />

//         {/* Root Family Section */}
//         <div className="text-center my-8">
//           <h2 className="text-2xl font-bold text-purple-700 bg-purple-100 px-6 py-3 rounded-full inline-block border border-purple-300">
//             🏠 Your Family
//           </h2>
//         </div>

//         {/* Main Tree Visualization (only shows descendants) */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 border mb-8">
//           <div className="flex justify-center">
//             <FamilyNode 
//               node={treeData.tree} 
//               onNodeClick={handleNodeClick}
//               isRoot={true}
//             />
//           </div>
//         </div>

//         {/* Debug Info */}
//         <div className="text-center text-sm text-gray-500 mb-4">
//           <p>Found {ancestors.length} ancestors and {descendantsCount} descendants</p>
//         </div>

//         {/* Debug Button */}
//         <DebugTree tree={treeData.tree} ancestors={ancestors} />

//         {/* Selected Family Members Modal */}
//         {selectedFamily && (
//           <MembersList
//             members={selectedFamily.members}
//             familyName={selectedFamily.family_name}
//             onClose={handleCloseMembers}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default FamilyTree;
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axios";

// ====================================================================
// FamilyNode Component: Renders a single family node with children
// ====================================================================
const FamilyNode = ({ node, onNodeClick, isRoot = false, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getNodeType = () => {
    if (isRoot) return 'root';
    if (level < 0) return 'ancestor';
    if (level > 0) return 'descendant';
    return 'current';
  };

  const nodeType = getNodeType();
  
  const nodeStyles = {
    root: 'bg-gradient-to-br from-purple-100 to-purple-50 border-purple-400 shadow-lg',
    ancestor: 'bg-gradient-to-br from-yellow-100 to-yellow-50 border-yellow-400',
    descendant: 'bg-gradient-to-br from-green-100 to-green-50 border-green-400',
    current: 'bg-gradient-to-br from-blue-100 to-blue-50 border-blue-400'
  };

  return (
    <div className="flex flex-col items-center">
      {/* Node Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: level * 0.1 }}
        className={`flex flex-col items-center p-4 rounded-xl border-2 min-w-[220px] ${
          nodeStyles[nodeType]
        } shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:scale-105`}
        onClick={() => onNodeClick?.(node)}
      >
        {/* Family Photo/Icon */}
        <div className={`w-16 h-16 rounded-full flex items-center justify-center 
          mb-3 border-2 shadow-inner ${
            nodeType === 'root' ? 'bg-gradient-to-br from-purple-500 to-purple-600 border-purple-300' :
            nodeType === 'ancestor' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-300' :
            nodeType === 'descendant' ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-300' :
            'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-300'
          } text-white font-bold`}>
          {node.familyPhoto ? (
            <img
              src={node.familyPhoto}
              alt={node.family_name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            node.family_name?.charAt(0)?.toUpperCase() || 'F'
          )}
        </div>

        {/* Family Name */}
        <h3 className={`font-bold text-center text-sm mb-2 ${
          nodeType === 'root' ? 'text-purple-800' :
          nodeType === 'ancestor' ? 'text-yellow-800' :
          nodeType === 'descendant' ? 'text-green-800' :
          'text-blue-800'
        }`}>
          {node.family_name || 'Family'}
        </h3>

        {/* Generation Badge */}
        <div className={`text-xs px-3 py-1 rounded-full mb-2 font-semibold ${
          nodeType === 'root' ? 'bg-purple-200 text-purple-800' :
          nodeType === 'ancestor' ? 'bg-yellow-200 text-yellow-800' :
          nodeType === 'descendant' ? 'bg-green-200 text-green-800' :
          'bg-blue-200 text-blue-800'
        }`}>
          {nodeType === 'root' ? 'Your Family' : 
           nodeType === 'ancestor' ? `Ancestor (Gen ${Math.abs(level)})` :
           level === 1 ? 'Child' :
           level === 2 ? 'Grandchild' :
           `Generation ${level}`}
        </div>

        {/* Members Count */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
          <span className="bg-white px-2 py-1 rounded-full border shadow-sm">
            👥 {node.members?.length || 0} members
          </span>
        </div>

        {/* Root Members */}
        <div className="flex flex-col gap-1 w-full mb-2">
          {node.rootMembers?.male && (
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded text-center border border-blue-200">
              ♂ {node.rootMembers.male.name || node.rootMembers.male.fullname}
            </div>
          )}
          {node.rootMembers?.female && (
            <div className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded text-center border border-pink-200">
              ♀ {node.rootMembers.female.name || node.rootMembers.female.fullname}
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        {node.children && node.children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className={`mt-2 text-xs px-3 py-1 rounded-full transition-colors font-medium ${
              nodeType === 'root' ? 'bg-purple-200 hover:bg-purple-300 text-purple-800' :
              nodeType === 'ancestor' ? 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800' :
              nodeType === 'descendant' ? 'bg-green-200 hover:bg-green-300 text-green-800' :
              'bg-blue-200 hover:bg-blue-300 text-blue-800'
            }`}
          >
            {isExpanded ? '▲ Collapse' : '▼ Expand'} ({node.children.length})
          </button>
        )}
      </motion.div>

      {/* Children Nodes - Horizontal Layout */}
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="mt-6 relative">
          {/* Vertical connecting line from parent to children level */}
          <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-gray-400 transform -translate-x-1/2 -translate-y-full"></div>
          
          {/* Horizontal connecting line across all children */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-400 transform -translate-y-full"></div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {node.children.map((childNode, index) => (
              <div key={childNode.family_id || index} className="flex flex-col items-center relative">
                {/* Individual child connecting line */}
                <div className="absolute top-0 w-24 h-0.5 bg-gray-400 transform -translate-y-full"></div>
                
                <FamilyNode 
                  node={childNode} 
                  onNodeClick={onNodeClick}
                  level={level + 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ====================================================================
// AncestorsLine Component: Displays ancestors ABOVE the root family
// ====================================================================
const AncestorsLine = ({ ancestors, onNodeClick }) => {
  if (!ancestors || ancestors.length === 0) {
    return (
      <div className="text-center mb-8 p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border-2 border-yellow-200 shadow-sm">
        <div className="text-4xl mb-3">🌳</div>
        <p className="text-yellow-700 font-medium">No ancestors found in your family tree.</p>
        <p className="text-yellow-600 text-sm mt-1">You're the start of your family legacy!</p>
      </div>
    );
  }

  // Sort ancestors by depth (most distant first -> -3, -2, -1)
  const sortedAncestors = [...ancestors].sort((a, b) => a.depth - b.depth);

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-bold text-yellow-700 mb-8 bg-gradient-to-r from-yellow-100 to-amber-100 px-8 py-4 rounded-full border-2 border-yellow-300 text-center shadow-md">
        🏛️ Family Ancestors
      </h3>
      <div className="flex flex-col items-center gap-8 w-full">
        {sortedAncestors.map((ancestor, index) => (
          <motion.div
            key={ancestor.family_id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center relative"
          >
            {/* Connecting line between ancestors */}
            {index > 0 && (
              <div className="absolute -top-8 left-1/2 w-0.5 h-8 bg-yellow-400 transform -translate-x-1/2"></div>
            )}
            
            <div 
              className="flex flex-col items-center p-6 rounded-2xl border-2 bg-gradient-to-br from-yellow-100 to-amber-50 border-yellow-500 min-w-[240px] shadow-lg hover:shadow-xl transition-all cursor-pointer z-10 transform hover:scale-105"
              onClick={() => onNodeClick(ancestor)}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-500 to-amber-600 border-2 border-yellow-300 text-white font-bold mb-4 shadow-inner">
                {ancestor.familyPhoto ? (
                  <img
                    src={ancestor.familyPhoto}
                    alt={ancestor.family_name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  ancestor.family_name?.charAt(0)?.toUpperCase() || 'F'
                )}
              </div>

              <h4 className="font-bold text-center text-yellow-800 mb-2 text-lg">
                {ancestor.family_name || 'Family'}
              </h4>

              <div className="text-sm bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full mb-3 font-semibold border border-yellow-300">
                {ancestor.depth === -1 ? 'Parent' : 
                 ancestor.depth === -2 ? 'Grandparent' :
                 ancestor.depth === -3 ? 'Great-Grandparent' :
                 `Generation ${Math.abs(ancestor.depth)}`}
              </div>

              <div className="text-sm bg-white px-3 py-1 rounded-full border-2 border-yellow-200 text-yellow-700 shadow-sm">
                👥 {ancestor.members?.length || 0} members
              </div>
            </div>

            {/* Generation arrow */}
            {index < sortedAncestors.length - 1 && (
              <div className="mt-4 text-yellow-500 text-2xl animate-bounce">↓</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ====================================================================
// MembersList Component
// ====================================================================
const MembersList = ({ members, familyName, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto shadow-2xl border-2 border-purple-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b-2 border-purple-100">
          <h3 className="text-xl font-bold text-gray-800">Members of {familyName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-3">
          {!members || members.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-500">No members in this family</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.user_id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-purple-50 hover:to-blue-50 transition-all border border-gray-100 hover:border-purple-200">
                {member.profilePhoto ? (
                  <img
                    src={member.profilePhoto}
                    alt={member.name || member.fullname}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {(member.name || member.fullname)?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{member.name || member.fullname}</p>
                  <p className="text-xs text-gray-600 capitalize flex items-center gap-1">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                      member.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
                    }`}>
                      {member.gender === 'male' ? '♂' : '♀'}
                    </span>
                    {member.gender}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ====================================================================
// DebugTree Component
// ====================================================================
const DebugTree = ({ treeData }) => {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-6 right-6 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm shadow-lg transition-colors z-40"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 text-white p-6 overflow-auto z-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Debug Tree Data</h3>
          <button
            onClick={() => setShowDebug(false)}
            className="bg-red-600 hover:bg-red-700 w-10 h-10 rounded-full text-xl font-bold transition-colors"
          >
            ×
          </button>
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl overflow-auto max-h-96">
          <pre>{JSON.stringify(treeData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// Main FamilyTree Component
// ====================================================================
const FamilyTree = () => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFamily, setSelectedFamily] = useState(null);

  const fetchFamilyTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedFamily(null);

    try {
      const response = await api.get('/family/tree');
      console.log('Full API Response:', response.data);
      
      // Transform data to handle both formats
      const data = response.data;
      const transformedData = {
        tree: data.tree || data.currentFamily, // Use tree if available, otherwise currentFamily
        ancestors: data.ancestors || [],
        descendants: data.descendants || [],
        currentUser: data.currentUser
      };
      
      console.log('Transformed Data:', transformedData);
      setTreeData(transformedData);
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err.response?.data?.error || err.message;
      
      if (errorMessage.includes("not a member") || errorMessage.includes("not a root member")) {
        setError("NO_FAMILY_ROOT_ERROR");
      } else {
        setError("❌ " + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamilyTree();
  }, [fetchFamilyTree]);

  const handleNodeClick = (node) => {
    setSelectedFamily(node);
  };

  const handleCloseMembers = () => {
    setSelectedFamily(null);
  };

  // Get the main tree structure
  const mainTree = treeData?.tree;
  const ancestors = treeData?.ancestors || [];

  // Count total descendants recursively
  const countDescendants = (node) => {
    if (!node || !node.children) return 0;
    let count = node.children.length;
    node.children.forEach(child => {
      count += countDescendants(child);
    });
    return count;
  };

  const totalDescendants = mainTree ? countDescendants(mainTree) : 0;

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-purple-600 mb-2">Loading Your Family Tree</h2>
          <p className="text-gray-600">Discovering generations of family connections...</p>
        </div>
      </div>
    );
  }

  // Error States
  if (error === "NO_FAMILY_ROOT_ERROR") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-center">
        <div className="bg-white rounded-3xl p-10 max-w-md shadow-2xl border-2 border-purple-200">
          <div className="text-7xl mb-6">🌳</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Start Your Family Legacy</h2>
          <p className="text-gray-600 mb-8">Create your family tree to begin exploring your heritage.</p>
          <button className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg transform hover:scale-105">
            🌟 Create Your Family
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-center">
        <div className="bg-white rounded-3xl p-8 max-w-md shadow-2xl border-2 border-red-200">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Family Tree</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchFamilyTree}
            className="px-8 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-lg"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!mainTree) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center bg-white p-10 rounded-3xl shadow-2xl border-2 border-purple-200">
          <div className="text-6xl mb-4">🏠</div>
          <p className="text-lg text-gray-600 mb-6">No family data available yet.</p>
          <button
            onClick={fetchFamilyTree}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Load Family Tree
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          >
            Family Tree
          </motion.h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Exploring the legacy of <strong className="text-purple-700">{treeData.currentUser?.name || treeData.currentUser?.fullname || 'your family'}</strong>
          </p>
        </div>

        {/* Ancestors Section */}
        <AncestorsLine 
          ancestors={ancestors} 
          onNodeClick={handleNodeClick}
        />

        {/* Current Family Section */}
        <div className="text-center my-12">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-3xl font-bold text-purple-700 bg-gradient-to-r from-purple-100 to-blue-100 px-8 py-4 rounded-2xl border-2 border-purple-300 inline-block shadow-lg"
          >
            🏠 Your Family
          </motion.h2>
        </div>

        {/* Main Tree Visualization */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-purple-100 mb-12">
          <div className="flex justify-center">
            <FamilyNode 
              node={mainTree} 
              onNodeClick={handleNodeClick}
              isRoot={true}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="text-center text-lg text-gray-600 mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-100 shadow-lg">
          <p className="font-semibold">
            Found <span className="text-yellow-600">{ancestors.length}</span> ancestors and {' '}
            <span className="text-green-600">{totalDescendants}</span> descendants across your family tree
          </p>
        </div>

        {/* Debug Button */}
        <DebugTree treeData={treeData} />

        {/* Selected Family Members Modal */}
        {selectedFamily && (
          <MembersList
            members={selectedFamily.members}
            familyName={selectedFamily.family_name}
            onClose={handleCloseMembers}
          />
        )}
      </div>
    </div>
  );
};

export default FamilyTree;