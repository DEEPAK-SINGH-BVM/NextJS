import { useState } from "react";
import axios from "axios";

const Nodemailer = () => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  //   const [file, setFile] = useState([]);
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     // formData is use to send File to server side
  //     at time we only send in one format formData , json
  //     const formData = FormData();
  //     formData.append("to", to);
  //     formData.append("subject", subject);
  //     formData.append("message", message);
  //     //
  //     for (let i = 0; i < file.length; i++) {
  //       formData.append("Files", file[i]);
  //     }

  //     const res =  axios.post("http://localhost:8010/api/send", formData);
  //     console.log(res.data);
  //     alert("Message Send Successfully ");
  //   };
  console.log("..",files);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("message", message);

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    const res = await axios.post("http://localhost:8020/api/send", formData);
    console.log("response data :", res.data);
    alert("Message Send");
       console.log("...", files);
       
    // without files
    // await axios.post("http://localhost:8020/api/send", {
    //   from: "deepaksingh.bvminfotech@gmail.com",
    //   to,
    //   subject,
    //   message,
    // });

    setTo("");
    setSubject("");
    setMessage("");
    setFiles([]);
    e.target.reset();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter Email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Enter Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Message to Send...."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      ></textarea>
      <br />
      <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
      <br />
      <button type="submit">Send Email</button>
    </form>
  );
};

export default Nodemailer;
