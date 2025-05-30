import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { db } from "../../Firebase";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const AddProject = () => {
  const projectId = uuidv4();
  const admin = useSelector((state) => state.admin);
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]); // State to store selected users
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = db.collection("Projects").onSnapshot((snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProjects(data);
    });

    db.collection("user")
      .get()
      .then((snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      });

    return () => unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !title.trim() ||
      !date ||
      !description.trim() ||
      selectedUsers.length === 0
    ) {
      toast.warning("Fill All the Details!", {
        autoClose: 1500,
      });
      return;
    }
    // If all fields are filled, proceed with the submission
    if (editingProjectId) {
      handleSaveEditProduct(e);
    } else {
      handleAddProject();
    }
  };

  const handleAddProject = () => {
    db.collection(`Projects`)
      .where("Title", "==", title)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          db.collection(`Projects`)
            .add({
              ProjectId: projectId,
              Title: title,
              DueDate: date,
              Description: description,
              SelectedUsers: selectedUsers,
              Tasks: [],
              AdminComments: [],
              UserComments: [],
            })
            .then((docRef) => {
              console.log("Project Added:", docRef.id);
              toast.success("Project Added!", {
                autoClose: 1500,
              });
              navigate(`/admin/${projectId}/addtask`);
              setTitle("");
              setDate("");
              setDescription("");
              setSelectedUsers([]);
            })
            .catch((error) => {
              console.error("Error adding project:", error);
            });
        } else {
          console.log("Duplicate Project found");
          toast.warning("Project Name Exists!", {
            autoClose: 1500,
            toastId: "samename",
          });
        }
      })
      .catch((error) => {
        console.error("Error querying document:", error);
      });
  };

  const handleEditProject = (projectId) => {
    const projectToEdit = projects.find((project) => project.id === projectId);
    if (projectToEdit) {
      setEditingProjectId(projectId);
      setTitle(projectToEdit.Title);
      setDate(projectToEdit.DueDate);
      setDescription(projectToEdit.Description);
      setSelectedUsers(projectToEdit.SelectedUsers);
    }
  };

  const handleSaveEditProduct = (e) => {
    e.preventDefault();
    const projectToEdit = projects.find(
      (project) => project.id === editingProjectId
    );
    if (projectToEdit.Title !== title) {
      const isDuplicate = projects.some(
        (project) => project.Title.toLowerCase() === title.toLowerCase()
      );
      if (isDuplicate) {
        toast.warning("Project Name Exists!", {
          autoClose: 1500,
          toastId: "sametask",
        });
        return;
      }
    }

    if (
      !title.trim() ||
      !date ||
      !description.trim() ||
      selectedUsers.length === 0
    ) {
      toast.warning("Fill in all the details.", { autoClose: 1500 });
      return;
    }

    db.collection("Projects")
      .doc(editingProjectId)
      .update({
        Title: title,
        DueDate: date,
        Description: description,
        SelectedUsers: selectedUsers,
      })
      .then(() => {
        toast.success("Project Updated!", { autoClose: 1500 });
        console.log("Project updated in Firestore:", editingProjectId);
        setEditingProjectId(null);
        setTitle("");
        setDate("");
        setDescription("");
        setSelectedUsers([]);
      })
      .catch((error) => {
        console.error("Error updating project in Firestore: ", error);
      });
  };

  const animatedComponents = makeAnimated();

  const userOptions = users.map((user) => ({
    value: user.email,
    label: user.name,
  }));

  return (
    <>
      {admin ? (
        <div className="container border rounded p-3 mt-4">
          <div className="mb-5">
            <h1 className="text-center mb-3">Add/Manage Projects</h1>
            <div className="row g-2">
              <div className="col-lg-6">
                <div
                  className="container bg-white border border-dark shadow rounded p-3"
                  style={{ maxWidth: "500px" }}
                >
                  <form onSubmit={handleSubmit}>
                    <div className="form-floating">
                      <input
                        type="text"
                        placeholder="Title"
                        className="form-control mb-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                      <label htmlFor="floatingInput">Title</label>
                    </div>
                    <div className="form-floating">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="form-control mb-2"
                        required
                      />
                      <label htmlFor="floatingInput">Due Date</label>
                    </div>
                    <div className="form-floating">
                      <textarea
                        placeholder="Description"
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="form-control mb-2 mt-3"
                        required
                      />
                      <label htmlFor="floatingInput">Description</label>
                    </div>
                    <Select
                      className="mb-2"
                      placeholder="Select User."
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      options={userOptions}
                      isMulti
                      value={selectedUsers} // Set selected users
                      onChange={(selected) => setSelectedUsers(selected)} // Update selected users
                    />
                    <div className="text-center">
                      <button type="submit" className="btn btn-success">
                        {editingProjectId ? "Save" : "Add Project"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="table-responsive">
                  <table
                    className="table table-bordered mx-auto shadow border border-dark rounded"
                    style={{ maxWidth: "500px" }}
                  >
                    <thead className="table-dark">
                      <tr>
                        <th className="text-center">Project Name</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((project, index) => (
                        <tr className="mx-2" key={index}>
                          <td className="text-center">{project.Title}</td>
                          <td>
                            <button
                              className="mx-2 btn text-warning fa-solid fa-pen-to-square"
                              title="Edit project"
                              onClick={() => handleEditProject(project.id)}
                            ></button>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                navigate(`/admin/${project.ProjectId}/addtask`)
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className=" mb-1 bi bi-plus-circle"
                                viewBox="0 0 16 16"
                              >
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                              </svg>
                              &nbsp;Task
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mt-5 fs-1">
            You Are Not Authorized To Access This Page.
            <br />
            <Link to="/login">Login</Link>
          </div>
        </>
      )}
    </>
  );
};

export default AddProject;
