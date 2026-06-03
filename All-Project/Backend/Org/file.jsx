// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// const AdmindashBoard = () => {
//   const [user, setUser] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPage, setTotalPage] = useState(1);
//   const [limit, setLimit] = useState(10);

//   const [editUser, setEditUser] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     gender: "",
//     role: "",
//   });

//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [gender, setGender] = useState("");
//   const [role, setRole] = useState("");

//   const [editUserId, setEditUserId] = useState(null);
//   const navigate = useNavigate();

//   const fetchUser = async (pageNumber) => {
//     const response = await axios.get(
//       `http://localhost:7070/users?page=${pageNumber}&limit=${limit}`
//     );
//     setUser(response.data.users);
//     setTotalPage(response.data.totalPages);
//   };

//   useEffect(() => {
//     fetchUser(page);
//   }, [page, limit]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     await axios.post("http://localhost:7070/users/signup", {
//       firstName,
//       lastName,
//       email,
//       password,
//       gender,
//       role,
//     });

//     fetchUser(page);
//   };

//   const handleEdit = (user) => {
//     setEditUserId(user._id);
//     setEditUser({
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       gender: user.gender,
//       role: user.role,
//     });
//   };

//   const handleUpdate = async (id) => {
//     await axios.patch(`http://localhost:7070/users/${id}`, editUser);
//     setEditUserId(null);
//     fetchUser(page);
//   };

//   const handleDelete = async (id) => {
//     await axios.delete(`http://localhost:7070/users/${id}`);
//     fetchUser(page);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   return (
//     <div>
//       <button onClick={handleLogout}>LogOut</button>

//       <h2 style={{ textAlign: "center" }}>Admin DashBoard</h2>

//       <form onSubmit={handleSubmit}>
//         <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
//         <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
//         <input value={email} onChange={(e) => setEmail(e.target.value)} />
//         <input value={password} onChange={(e) => setPassword(e.target.value)} />

//         <select value={gender} onChange={(e) => setGender(e.target.value)} required>
//           <option value="" disabled>Select gender</option>
//           <option value="male">Male</option>
//           <option value="female">Female</option>
//         </select>

//         <select value={role} onChange={(e) => setRole(e.target.value)}>
//           <option value="user">user</option>
//           <option value="admin">admin</option>
//         </select>

//         <button type="submit">Submit</button>
//       </form>

//       <table border="1">
//         <thead>
//           <tr>
//             <th>First</th>
//             <th>Last</th>
//             <th>Email</th>
//             <th>Gender</th>
//             <th>Role</th>
//             <th>Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {user.map((p) =>
//             p.role !== "superadmin" ? (
//               <tr key={p._id}>
//                 <td>
//                   {editUserId === p._id ? (
//                     <input
//                       value={editUser.firstName}
//                       onChange={(e) =>
//                         setEditUser({ ...editUser, firstName: e.target.value })
//                       }
//                     />
//                   ) : (
//                     p.firstName
//                   )}
//                 </td>

//                 <td>
//                   {editUserId === p._id ? (
//                     <input
//                       value={editUser.lastName}
//                       onChange={(e) =>
//                         setEditUser({ ...editUser, lastName: e.target.value })
//                       }
//                     />
//                   ) : (
//                     p.lastName
//                   )}
//                 </td>

//                 <td>
//                   {editUserId === p._id ? (
//                     <input
//                       value={editUser.email}
//                       onChange={(e) =>
//                         setEditUser({ ...editUser, email: e.target.value })
//                       }
//                     />
//                   ) : (
//                     p.email
//                   )}
//                 </td>

//                 <td>
//                   {editUserId === p._id ? (
//                     <input
//                       value={editUser.gender}
//                       onChange={(e) =>
//                         setEditUser({ ...editUser, gender: e.target.value })
//                       }
//                     />
//                   ) : (
//                     p.gender
//                   )}
//                 </td>

//                 <td>
//                   {editUserId === p._id ? (
//                     <input
//                       value={editUser.role}
//                       onChange={(e) =>
//                         setEditUser({ ...editUser, role: e.target.value })
//                       }
//                     />
//                   ) : (
//                     p.role
//                   )}
//                 </td>

//                 <td>
//                   {editUserId === p._id ? (
//                     <button onClick={() => handleUpdate(p._id)}>Save</button>
//                   ) : (
//                     <button onClick={() => handleEdit(p)}>Edit</button>
//                   )}
//                   <button onClick={() => handleDelete(p._id)}>Delete</button>
//                 </td>
//               </tr>
//             ) : null
//           )}
//         </tbody>
//       </table>

//       <select
//         value={limit}
//         onChange={(e) => setLimit(Number(e.target.value))}
//       >
//         <option value={10}>10</option>
//         <option value={25}>25</option>
//         <option value={50}>50</option>
//       </select>

//       <button disabled={page === 1} onClick={() => setPage(page - 1)}>
//         <ChevronLeftIcon width="15px" />
//       </button>

//       <span>Page {page} of {totalPage}</span>

//       <button disabled={page === totalPage} onClick={() => setPage(page + 1)}>
//         <ChevronRightIcon width="15px" />
//       </button>
//     </div>
//   );
// };

// export default AdmindashBoard;
// ///////////////////////////////////////
// {user
//   .filter((p) => p.role !== "superadmin")
//   .map((p) => (
//     <tr key={p._id}>
//       ...
//     </tr>
//   ))}
// ////////////////////////////////////////
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// const SuperDashboard = () => {
//   const [users, setUsers] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPage, setTotalPage] = useState(1);
//   const [limit, setLimit] = useState(5);
//   const [role, setRole] = useState("all");

//   const navigate = useNavigate();

//   const fetchUsers = async (pageNumber) => {
//     const res = await axios.get(
//       `http://localhost:7070/users?page=${pageNumber}&limit=${limit}`
//     );

//     //  FRONTEND FILTER FIRST
//     const filteredUsers =
//       role === "all"
//         ? res.data.users
//         : res.data.users.filter((u) => u.role === role);

//     setUsers(filteredUsers);

//     // FIX PAGINATION COUNT
//     setTotalPage(
//       Math.ceil(
//         (role === "all"
//           ? res.data.users.length
//           : filteredUsers.length) / limit
//       )
//     );
//   };

//   useEffect(() => {
//     fetchUsers(page);
//   }, [page, limit, role]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   return (
//     <div>
//       <button onClick={handleLogout}>Logout</button>
//       <h2>Super Admin Dashboard</h2>

//       {/* ROLE FILTER */}
//       <select
//         value={role}
//         onChange={(e) => {
//           setRole(e.target.value);
//           setPage(1);
//         }}
//       >
//         <option value="all">All</option>
//         <option value="user">User</option>
//         <option value="admin">Admin</option>
//         <option value="superadmin">SuperAdmin</option>
//       </select>

//       <table border="1">
//         <thead>
//           <tr>
//             <th>First</th>
//             <th>Last</th>
//             <th>Email</th>
//             <th>Gender</th>
//             <th>Role</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((u) => (
//             <tr key={u._id}>
//               <td>{u.firstName}</td>
//               <td>{u.lastName}</td>
//               <td>{u.email}</td>
//               <td>{u.gender}</td>
//               <td>{u.role}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* PAGINATION */}
//       <select
//         value={limit}
//         onChange={(e) => {
//           setLimit(Number(e.target.value));
//           setPage(1);
//         }}
//       >
//         <option value={5}>5</option>
//         <option value={10}>10</option>
//         <option value={25}>25</option>
//       </select>

//       <button disabled={page === 1} onClick={() => setPage(page - 1)}>
//         <ChevronLeftIcon width={15} />
//       </button>

//       <span>
//         Page {page} of {totalPage}
//       </span>

//       <button
//         disabled={page === totalPage}
//         onClick={() => setPage(page + 1)}
//       >
//         <ChevronRightIcon width={15} />
//       </button>
//     </div>
//   );
// };

// export default SuperDashboard;

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

// const SuperDashboard = () => {
//   const [user, setUser] = useState([]);
//   const [page, setPage] = useState(1);
//   const [totalPage, setTotalPage] = useState(1);
//   const [limit, setLimit] = useState(10);

//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     gender: "",
//     role: "",
//   });

//   const [editUser, setEditUser] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     gender: "",
//     role: "",
//   });

//   const [editUserId, setEditUserId] = useState(null);
//   const navigate = useNavigate();

//   const fetchUser = async (pageNumber = page) => {
//     const response = await axios.get(
//       `http://localhost:7070/users?page=${pageNumber}&limit=${limit}`
//     );
//     setUser(response.data.users);
//     setTotalPage(response.data.totalPages);
//   };

//   useEffect(() => {
//     fetchUser(page);
//   }, [page, limit]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     await axios.post("http://localhost:7070/users/signup", formData);

//     setFormData({
//       firstName: "",
//       lastName: "",
//       email: "",
//       password: "",
//       gender: "",
//       role: "",
//     });

//     fetchUser(page);
//   };

//   const handleEdit = (u) => {
//     setEditUserId(u._id);
//     setEditUser({
//       firstName: u.firstName,
//       lastName: u.lastName,
//       email: u.email,
//       gender: u.gender,
//       role: u.role,
//     });
//   };

//   const handleUpdate = async (id) => {
//     await axios.patch(`http://localhost:7070/users/${id}`, editUser);
//     setEditUserId(null);
//     fetchUser(page);
//   };

//   const handleDelete = async (id) => {
//     await axios.delete(`http://localhost:7070/users/${id}`);
//     fetchUser(page);
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   return (
//     <div>
//       <button onClick={handleLogout}>Logout</button>
//       <h2>Super Dashboard</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           placeholder="First Name"
//           value={formData.firstName}
//           onChange={(e) =>
//             setFormData({ ...formData, firstName: e.target.value })
//           }
//         />
//         <br />

//         <input
//           placeholder="Last Name"
//           value={formData.lastName}
//           onChange={(e) =>
//             setFormData({ ...formData, lastName: e.target.value })
//           }
//         />
//         <br />

//         <input
//           placeholder="Email"
//           value={formData.email}
//           onChange={(e) =>
//             setFormData({ ...formData, email: e.target.value })
//           }
//         />
//         <br />

//         <input
//           type="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={(e) =>
//             setFormData({ ...formData, password: e.target.value })
//           }
//         />
//         <br />

//         <select
//           value={formData.gender}
//           onChange={(e) =>
//             setFormData({ ...formData, gender: e.target.value })
//           }
//           required
//         >
//           <option value="">Select Gender</option>
//           <option value="male">Male</option>
//           <option value="female">Female</option>
//         </select>
//         <br />

//         <select
//           value={formData.role}
//           onChange={(e) =>
//             setFormData({ ...formData, role: e.target.value })
//           }
//         >
//           <option value="user">User</option>
//           <option value="admin">Admin</option>
//           <option value="superadmin">Super Admin</option>
//         </select>
//         <br />

//         <button type="submit">Submit</button>
//       </form>
//     </div>
//   );
// };
////////
// import jwt from "jsonwebtoken";

// const checkToken = (req, res, next) => {
//   const token = req.headers.authorization;

//   if (!token) {
//     return res.status(401).send({ message: "No Token" });
//   }

//   const decoded = jwt.decode(token);
//   const currentTime = Date.now() / 1000;

//   if (decoded.exp < currentTime) {
//     return res.status(401).send({ message: "Token Expired" });
//   }

//   req.user = decoded;
//   next();
// };

// export default checkToken;
//
// import { jwtDecode } from "jwt-decode";
// import { Navigate } from "react-router-dom";

// const AuthRoute = ({ children }) => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     return children;
//   }

//   fetch("/check-token", {
//     headers: {
//       Authorization: token,
//     },
//   }).then(res => {
//     if (res.status === 401) {
//       localStorage.removeItem("token");
//       window.location.href = "/login";
//     }
//   });

//   const { role } = jwtDecode(token);

//   if (role === "superadmin") return <Navigate to="/superDashboard" />;
//   if (role === "admin") return <Navigate to="/adminDashboard" />;
//   if (role === "user") return <Navigate to="/userDashboard" />;
// };

// export default AuthRoute;