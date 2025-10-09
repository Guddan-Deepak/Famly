// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { motion } from "framer-motion";
// import api from "../../utils/axios";
// import { useAuth } from "../../utils/authContext";
// import { saveAuthData } from "../../utils/auth.utils";
// import { User, Lock, Mail, Phone, Calendar, Camera, UserPlus, LogIn } from "lucide-react";
// import { useNavigate } from "react-router-dom";




// const AuthCard = () => {
//   const [mode, setMode] = useState("signin"); // "signin" | "signup"
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();

//   const navigate = useNavigate()
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm();

//   const onSubmit = async (data) => {
//     setLoading(true);
//     try {
//       if (mode === "signin") {
//         const res = await api.post("/user/login", data);
//         console.log(res.data.data)
//         await login(res.data.data);
//       } else {

//         if (data.password !== data.confirmPassword) {
//           alert("Passwords do not match!");
//           setLoading(false);
//           return;
//         }

//         // const { confirmPassword, ...signupData } = data; // Exclude confirmPassword for backend

//         const formData = new FormData();
//         Object.entries(data).forEach(([key, value]) => {

//           if (key !== 'confirmPassword') {

//             if (key === 'profilePhoto' && value.length > 0) {
//               formData.append(key, value[0]);  // Adding the first file from profilePhoto
//             } else {
//               formData.append(key, value);  // Append other fields normally
//             }
//           }
//         });




//         const res = await api.post("/user/register", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });

//         console.log(res.data.data)

//         await login(res.data.data);

//       }
//       reset();
//       navigate('/');
//     } catch (err) {
//       console.error(err);
//       alert(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (

//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="w-full max-w-md bg-white/60 backdrop-blur-md border border-purple-100 rounded-2xl p-6 shadow-md"

//     >
//       <h2 className="text-center text-2xl font-semibold text-purple-700">
//         Welcome to FAMLY
//       </h2>
//       <p className="text-center text-sm text-purple-500 mb-4">
//         Sign in to your account or create a new one
//       </p>

//       {/* Tabs */}
//       <div className="flex mb-6 bg-purple-100 rounded-full p-1" >
//         <button
//           onClick={() => setMode("signin")}
//           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${mode === "signin"
//               ? "bg-white shadow text-purple-700 font-semibold"
//               : "text-purple-500"
//             }`}
//         >
//           <LogIn className="w-4 h-4" />
//           Sign In
//         </button>
//         <button
//           onClick={() => setMode("signup")}
//           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${mode === "signup"
//               ? "bg-white shadow text-purple-700 font-semibold"
//               : "text-purple-500"
//             }`}
//         >
//           <UserPlus className="w-4 h-4" />
//           Create Account
//         </button>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         {mode === "signup" && (
//           <>
//             <div>
//               <label className="text-sm text-purple-700 font-medium">
//                 Full Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 {...register("fullname", { required: true })}
//                 placeholder="Enter your full name"
//                 className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//               />
//               {errors.fullName && (
//                 <span className="text-xs text-red-500">Full name required</span>
//               )}
//             </div>

//             <div>
//               <label className="text-sm text-purple-700 font-medium">
//                 Username <span className="text-red-500">*</span>
//               </label>
//               {/* <input
//                   type="text"
//                   {...register("username", { required: true })}
//                   placeholder="Choose a unique username"
//                   className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                 /> */}
//               <input
//                 type="text"
//                 {...register("username", {
//                   required: "Username is required",
//                   pattern: {
//                     value: /^[a-zA-Z0-9_]+$/,
//                     message: "Username can only contain letters, numbers, and underscores (no spaces)",
//                   },
//                 })}
//                 placeholder="Choose a unique username"
//                 className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//               />
//             </div>

//             <div>
//               <label className="text-sm text-purple-700 font-medium">
//                 Email Address <span className="text-red-500">*</span>
//               </label>
//               {/* <input
//                   type="email"
//                   {...register("email", { required: true })}
//                   placeholder="your@email.com"
//                   className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                 /> */}
//               <input
//                 type="email"
//                 {...register("email", {
//                   required: "Email is required",
//                   pattern: {
//                     value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
//                     message: "Email must end with @gmail.com",
//                   },
//                 })}
//                 placeholder="your@email.com"
//                 className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//               />
//             </div>

//             <div>
//               <label className="text-sm text-purple-700 font-medium">
//                 Phone Number <span className="text-red-500">*</span>
//               </label>
//               {/* <input
//                   type="tel"
//                   {...register("phone_no", { required: true })}
//                   placeholder="+91 955 123 4567"
//                   className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                 /> */}
//               <input
//                 type="tel"
//                 {...register("phone_no", {
//                   required: "Phone number is required",
//                   pattern: {
//                     value: /^[0-9]{10}$/,
//                     message: "Phone number must be exactly 10 digits",
//                   },
//                 })}
//                 placeholder="+91 955 123 4567"
//                 className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//               />
//             </div>

//             <div className="flex gap-3">
//               <div className="flex-1">
//                 <label className="text-sm text-purple-700 font-medium">
//                   Date of Birth <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   {...register("dob", { required: true })}
//                   className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                 />
//               </div>
//               <div className="flex-1">
//                 <label className="text-sm text-purple-700 font-medium">
//                   Gender <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   {...register("gender", { required: true })}
//                   className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//                 >
//                   <option value="">Select gender</option>
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>

//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="text-sm text-purple-700 font-medium">
//                 Profile Photo <span className="text-xs text-purple-400">(Optional)</span>
//               </label>
//               <input
//                 type="file"
//                 {...register("profilePhoto")}
//                 className="w-full mt-1 px-3 py-2 border rounded-md file:mr-3 file:py-1 file:px-3 file:bg-purple-100 file:border-none"
//               />
//             </div>
//           </>
//         )}

//         {/* Signin or Signup common fields */}
//         {mode === "signin" && (
//           <div>
//             <label className="text-sm text-purple-700 font-medium">
//               Email, Phone, or Username
//             </label>
//             <input
//               type="text"
//               {...register("identifier", { required: true })}
//               placeholder="Email, phone, or username"
//               className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//             />
//             <p className="text-xs text-purple-400 mt-1">
//               You can use your email address, phone number, or username
//             </p>
//           </div>
//         )}

//         <div>
//           <label className="text-sm text-purple-700 font-medium">
//             Password <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="password"
//             {...register("password", { required: true })}
//             placeholder={mode === "signin" ? "Enter your password" : "Create a secure password"}
//             className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//           />
//         </div>

//         {mode === "signup" && (
//           <div>
//             <label className="text-sm text-purple-700 font-medium">
//               Confirm Password <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="password"
//               {...register("confirmPassword", { required: true })}
//               placeholder="Confirm your password"
//               className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
//             />
//           </div>
//         )}

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 rounded-md font-medium hover:opacity-90 transition-all"
//         >
//           {loading ? "Processing..." : (
//             <>
//               {mode === "signin" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
//               {mode === "signin" ? "Sign In" : "Create Account"}
//             </>
//           )}
//         </button>
//       </form>

//       {(
//         <>
//           <div className="border-t mt-6 pt-3 text-center text-xs text-purple-400">
//             100% Free Forever
//           </div>
//           <p className="text-center text-xs text-purple-400 mt-2">
//             By creating an account, you agree to preserve and share your family's precious
//             memories with love.
//           </p>
//         </>
//       )}
//     </motion.div>

//   );
// };

// export default AuthCard;
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import { useAuth } from "../../utils/authContext";
import { UserPlus, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AuthCard = () => {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();

  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await api.post("/user/login", data);
        console.log(res.data.data)
        await login(res.data.data);
        toast.success("Welcome back! Successfully signed in.");
      } else {
        if (data.password !== data.confirmPassword) {
          toast.error("Passwords do not match!");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'confirmPassword') {
            if (key === 'profilePhoto' && value.length > 0) {
              formData.append(key, value[0]);  // Adding the first file from profilePhoto
            } else {
              formData.append(key, value);  // Append other fields normally
            }
          }
        });

        const res = await api.post("/user/register", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log(res.data.data)
        await login(res.data.data);
        toast.success("Account created successfully! Welcome to FAMLY.");
      }
      reset();
      navigate('/');
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google Login Handler
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      // Check if client ID exists
      if (!clientId) {
        toast.error("Google login is not configured properly. Please try another method.");
        setGoogleLoading(false);
        return;
      }

      console.log("Client ID:", clientId); // Debug log

      // Load Google Identity Services script if not already loaded
      if (!window.google) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Initialize Google OAuth client
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response) => {
          if (response.access_token) {
            await processGoogleLogin(response.access_token);
          } else {
            toast.error("Google login was cancelled");
            setGoogleLoading(false);
          }
        },
        error_callback: (error) => {
          console.error('Google OAuth error:', error);
          toast.error("Google login failed. Please try again.");
          setGoogleLoading(false);
        }
      });
      
      client.requestAccessToken();
      
    } catch (error) {
      console.error('Google login initialization error:', error);
      toast.error('Failed to initialize Google login');
      setGoogleLoading(false);
    }
  };

  const processGoogleLogin = async (accessToken) => {
    try {
      // Send the Google access token to your backend
      const res = await api.post("/user/login/google", {
        accessToken: accessToken
      });

      console.log('Google login response:', res.data.data);
      await login(res.data.data);
      toast.success("Welcome back! Successfully signed in with Google.");
      navigate('/');
    } catch (err) {
      console.error('Google login error:', err);
      
      if (err.response?.status === 404) {
        // User not found - show toast and redirect to signup
        toast.error("Account not found. Please create an account first.");
        setMode("signup"); // Switch to signup tab
      } else if (err.response?.status === 401) {
        toast.error("Google authentication failed. Please try again.");
      } else if (err.response?.status === 501 || err.response?.status === 500) {
        toast.error("Google login is temporarily unavailable. Please try email login.");
      } else {
        const errorMessage = err.response?.data?.message || 'Google login failed. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white/60 backdrop-blur-md border border-purple-100 rounded-2xl p-6 shadow-md"
    >
      <h2 className="text-center text-2xl font-semibold text-purple-700">
        Welcome to FAMLY
      </h2>
      <p className="text-center text-sm text-purple-500 mb-4">
        Sign in to your account or create a new one
      </p>

      {/* Tabs */}
      <div className="flex mb-6 bg-purple-100 rounded-full p-1" >
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${mode === "signin"
              ? "bg-white shadow text-purple-700 font-semibold"
              : "text-purple-500"
            }`}
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${mode === "signup"
              ? "bg-white shadow text-purple-700 font-semibold"
              : "text-purple-500"
            }`}
        >
          <UserPlus className="w-4 h-4" />
          Create Account
        </button>
      </div>

      {/* Google Login Button - Only show in signin mode */}
      {mode === "signin" && (
        <div className="mb-4">
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          <div className="relative flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-sm text-gray-500">or</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {mode === "signup" && (
          <>
            <div>
              <label className="text-sm text-purple-700 font-medium">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("fullname", { required: true })}
                placeholder="Enter your full name"
                className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
                autoComplete="name"
              />
              {errors.fullname && (
                <span className="text-xs text-red-500">Full name required</span>
              )}
            </div>

            <div>
              <label className="text-sm text-purple-700 font-medium">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("username", {
                  required: "Username is required",
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Username can only contain letters, numbers, and underscores (no spaces)",
                  },
                })}
                placeholder="Choose a unique username"
                className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
                autoComplete="username"
              />
              {errors.username && (
                <span className="text-xs text-red-500">{errors.username.message}</span>
              )}
            </div>

            <div>
              <label className="text-sm text-purple-700 font-medium">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                    message: "Email must end with @gmail.com",
                  },
                })}
                placeholder="your@email.com"
                className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
                autoComplete="email"
              />
              {errors.email && (
                <span className="text-xs text-red-500">{errors.email.message}</span>
              )}
            </div>

            <div>
              <label className="text-sm text-purple-700 font-medium">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register("phone_no", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                })}
                placeholder="+91 955 123 4567"
                className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
                autoComplete="tel"
              />
              {errors.phone_no && (
                <span className="text-xs text-red-500">{errors.phone_no.message}</span>
              )}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm text-purple-700 font-medium">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("dob", { required: true })}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
                  autoComplete="bday"
                />
                {errors.dob && (
                  <span className="text-xs text-red-500">Date of birth required</span>
                )}
              </div>
              <div className="flex-1">
                <label className="text-sm text-purple-700 font-medium">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("gender", { required: true })}
                  className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
                  autoComplete="sex"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && (
                  <span className="text-xs text-red-500">Gender required</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-purple-700 font-medium">
                Profile Photo <span className="text-xs text-purple-400">(Optional)</span>
              </label>
              <input
                type="file"
                {...register("profilePhoto")}
                className="w-full mt-1 px-3 py-2 border rounded-md file:mr-3 file:py-1 file:px-3 file:bg-purple-100 file:border-none"
                accept="image/*"
              />
            </div>
          </>
        )}

        {/* Signin or Signup common fields */}
        {mode === "signin" && (
          <div>
            <label className="text-sm text-purple-700 font-medium">
              Email, Phone, or Username
            </label>
            <input
              type="text"
              {...register("identifier", { required: true })}
              placeholder="Email, phone, or username"
              className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
              autoComplete="username"
            />
            {errors.identifier && (
              <span className="text-xs text-red-500">Email, phone, or username required</span>
            )}
            <p className="text-xs text-purple-400 mt-1">
              You can use your email address, phone number, or username
            </p>
          </div>
        )}

        <div>
          <label className="text-sm text-purple-700 font-medium">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            {...register("password", { required: true })}
            placeholder={mode === "signin" ? "Enter your password" : "Create a secure password"}
            className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
          {errors.password && (
            <span className="text-xs text-red-500">Password required</span>
          )}
        </div>

        {mode === "signup" && (
          <div>
            <label className="text-sm text-purple-700 font-medium">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              {...register("confirmPassword", { required: true })}
              placeholder="Confirm your password"
              className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="text-xs text-red-500">Please confirm your password</span>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 rounded-md font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : (
            <>
              {mode === "signin" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </>
          )}
        </button>
      </form>

      <div className="border-t mt-6 pt-3 text-center text-xs text-purple-400">
        100% Free Forever
      </div>
      <p className="text-center text-xs text-purple-400 mt-2">
        By creating an account, you agree to preserve and share your family's precious
        memories with love.
      </p>
    </motion.div>
  );
};

export default AuthCard;