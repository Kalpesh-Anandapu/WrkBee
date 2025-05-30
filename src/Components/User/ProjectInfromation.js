import React, { useEffect, useState } from "react";
import { db } from "../../Firebase";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "react-avatar";
import { useSelector } from "react-redux";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import ReactConfetti from "react-confetti";
import "../../App.css";

const ProjectInfromation = () => {
  const { id } = useParams();
  const user = useSelector((state) => state.user);
  const [project, setProject] = useState({
    AdminComments: [],
    UserComments: [],
  });
  const [daysLeft, setDaysLeft] = useState(null);
  const [daysOver, setDaysOver] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalShow, setModalShow] = React.useState(false);
  const [comment, setComment] = useState("");
  const [project_per, setProjectPer] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const workPercentageTasks = () => {
    if (project.Tasks) {
      let tasks = project.Tasks;

      for (let i = 0; i < tasks.length; i++) {
        let user = tasks[i].SelectedUsers;
        let counter = 0;

        for (let j = 0; j < user.length; j++) {
          if (user[j].Status === "Completed") {
            counter++;
          }
        }

        let work_percentage = (counter * 100) / user.length;
        tasks[i].workPercentage = work_percentage;
      }
    }
  };

  const calculateProjectPercentage = () => {
    if (project.Tasks) {
      let tasks = project.Tasks;
      let total_percentage = 0;

      for (let i = 0; i < tasks.length; i++) {
        total_percentage += tasks[i].workPercentage || 0;
      }

      let project_percentage = total_percentage / tasks.length;
      setProjectPer(project_percentage);
    }
  };

  useEffect(() => {
    workPercentageTasks();
  }, [project]);

  useEffect(() => {
    calculateProjectPercentage();
  }, [project]);

  const handleComment = (e) => {
    e.preventDefault();
    if (comment.trim() !== "") {
      db.collection("Projects")
        .where("ProjectId", "==", id)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let Comments = doc.data().UserComments;
            Comments.push({
              user: user,
              dateTime: new Date(),
              message: comment,
            });
            doc.ref.update({
              UserComments: Comments,
            });
          });
          toast.success("Comment Added!", {
            autoClose: 1500,
            position: "top-center",
          });
          setModalShow(false);
          setComment("");
        });
    } else {
      toast.warning("Please enter a comment before sending.", {
        autoClose: 1500,
        position: "top-center",
      });
    }
  };

  const addComment = () => {
    setModalShow(true);
  };

  const getProject = () => {
    db.collection("Projects")
      .where("ProjectId", "==", id)
      .onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          setProject(doc.data());
          setLoading(false);
        });
      });
  };

  useEffect(() => {
    getProject();
  }, []);

  useEffect(() => {
    if (project.DueDate) {
      const daysLeftValue = calculateDaysLeft();
      setDaysLeft(daysLeftValue);

      const daysOverValue = daysLeftValue < 0 ? Math.abs(daysLeftValue) : 0;
      setDaysOver(daysOverValue);
    }
  }, [project]);

  const calculateDaysLeft = () => {
    const dueDate = new Date(project.DueDate);
    const currentDate = new Date();
    const timeDiff = dueDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  const adminComments = project.AdminComments
    ? project.AdminComments.map((comment) => comment)
    : [];
  const userComments = project.UserComments
    ? project.UserComments.map((comment) => comment)
    : [];
  const mergedComments = [...adminComments, ...userComments];
  const sortedComments = mergedComments.sort((a, b) => a.dateTime - b.dateTime);

  useEffect(() => {
    if (project_per === 100) {
      setShowConfetti(true);

      const timeoutId = setTimeout(() => {
        setShowConfetti(false);
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [project_per]);

  return (
    <>
      {user ? (
        <>
          <div className="p-2">
            {showConfetti && (
              <ReactConfetti
                height={window.innerHeight}
                width={window.innerWidth}
              />
            )}
            <div
              className="container mt-2 mb-2 p-2 border rounded shadow"
              style={{ maxWidth: "1300px" }}
            >
              <div className="container-fluid">
                <div className="d-flex  border rounded shadow-sm mb-3 p-2">
                  <button
                    className="btn"
                    title="back"
                    onClick={() => navigate("/myprojects")}
                  >
                    <i className="fa-solid fa-circle-arrow-left fs-3"></i>
                  </button>
                  <div className="text-center flex-grow-1">
                    <h2>{project.Title}</h2>
                  </div>
                  <div>
                    <button
                      className="btn"
                      title="Comment"
                      onClick={() => {
                        addComment();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="35"
                        height="35"
                        fill="currentColor"
                        className="bi bi-chat-dots-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="row g-2">
                  <div className="col-lg-8">
                    <div>
                      {loading ? (
                        <div>Loading...</div>
                      ) : (
                        <div
                          className="container border rounded p-3 shadow mb-2"
                          style={{ borderRadius: "10px" }}
                        >
                          <div className="row">
                            <div className="col-lg-9 col-xs-10">
                              <p className="fs-3">About Project</p>
                              <p>{project.Description}</p>
                            </div>
                            <div className="col-lg-3 col-xs-2 p-2">
                              <div className="border rounded text-center shadow-sm p-2">
                                <span
                                  className={`badge rounded-pill ${
                                    daysLeft < 0 ? "bg-danger" : "bg-success"
                                  } fs-5 mt-1`}
                                >
                                  Due Date
                                </span>
                                <div className="p-3">
                                  {formatDate(project.DueDate)}
                                </div>
                                <span
                                  className={`badge rounded-pill ${
                                    daysLeft < 0 ? "bg-danger" : "bg-success"
                                  } mx-1`}
                                >
                                  {daysLeft < 0 ? daysOver : daysLeft}
                                </span>
                                {daysLeft < 0 ? "days late" : "days left"}
                              </div>
                            </div>
                          </div>
                          <h3 className="mx-2">Tasks</h3>
                          <div
                            className="card p-2 mt-3 border-dark"
                            style={{ maxWidth: "700px" }}
                          >
                            <div className="table-responsive">
                              <table
                                className="table table-hover"
                                style={{ maxWidth: "700px" }}
                              >
                                <thead>
                                  <tr>
                                    <th>Task Name</th>
                                    <th>Description</th>
                                    <th>Colleagues</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {project.Tasks.map((task, index) => (
                                    <tr key={index}>
                                      <td>{task.Title}</td>
                                      <td>{task.Description}</td>
                                      <td>
                                        {task.SelectedUsers.map(
                                          (user, index) => (
                                            <div key={index}>
                                              <span>
                                                {user.label.split(" ")[0]}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div
                            className="comments border rounded p-3 shadow mt-2 border-success-subtle border-3"
                            style={{ height: "50vh", overflowY: "auto" }}
                          >
                            <h3 className="mb-2">Comments</h3>
                            <div className="p-3">
                              {loading ? (
                                <>Loading...</>
                              ) : (
                                <>
                                  {sortedComments.map((comment, index) => (
                                    <div
                                      key={index}
                                      className={`row ${
                                        comment.user
                                          ? "justify-content-end"
                                          : "justify-content-start"
                                      }`}
                                    >
                                      <div className="col-10 col-md-8 col-lg-6">
                                        <div
                                          className={`${
                                            comment.user
                                              ? "text-end mb-1 p-2 rounded "
                                              : "text-start mb-1 p-2 rounded "
                                          } comment`}
                                          style={
                                            comment.user
                                              ? {
                                                  background: "#aaf683",
                                                  borderRight:
                                                    "3px solid #60d394",
                                                }
                                              : {
                                                  background: "#b8b8ff",
                                                  borderLeft:
                                                    "3px solid #8b60d5",
                                                }
                                          }
                                        >
                                          {comment.user ? (
                                            <>
                                              <span className="text-dark">
                                                {comment.message}
                                                <sub className="mx-1 mt-1">
                                                  {comment.dateTime
                                                    .toDate()
                                                    .toLocaleString("en-IN")}
                                                </sub>
                                              </span>
                                              <span>
                                                <Avatar
                                                  name={comment.user}
                                                  size={35}
                                                  round={true}
                                                  className="mx-1 mb-1"
                                                />
                                              </span>
                                            </>
                                          ) : (
                                            <span className="text-dark">
                                              {comment.message}
                                              <sub className="mx-1 mt-1">
                                                {comment.dateTime
                                                  .toDate()
                                                  .toLocaleString("en-IN")}
                                              </sub>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-lg-4 mb-3">
                    <div className="container border rounded shadow mb-2 p-2">
                      <h2 className="text-center">Project Status</h2>
                      <div className="mx-2 fs-3">
                        Progress&nbsp;:&nbsp;
                        <span className="badge rounded-pill bg-info text-dark fs-4">
                          {parseFloat(project_per).toFixed(2)}%
                        </span>
                      </div>
                      <div className="mx-2">
                        {project_per === 100 ? (
                          <>
                            <span className="fs-3">
                              Status&nbsp;:&nbsp;
                              <span className="text-success fs-4">
                                Completed
                              </span>
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="fs-3">
                              Status&nbsp;:&nbsp;
                              <span className="text-info fs-4">In Process</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="sidebar container shadow border rounded p-3">
                      <h2 className="mb-4 text-center">Colleagues</h2>
                      <ul className="list-unstyled">
                        {project.SelectedUsers &&
                          project.SelectedUsers.map((user, index) => (
                            <div
                              key={index}
                              className="container-sm mb-3 border rounded shadow-sm p-2"
                            >
                              <Avatar
                                name={user.value[0]}
                                size={40}
                                round={true}
                                className="me-2"
                                title={user.label}
                              />
                              <span>{user.label}</span>
                            </div>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal component */}
            <Modal
              show={modalShow}
              onHide={() => setModalShow(false)}
              size="md"
              aria-labelledby="contained-modal-title-vcenter"
              centered
            >
              <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                  Add Comment
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <form className="form">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                    className="form-control p-3 rounded w-100"
                    placeholder="Enter your comment here..."
                    required
                  />
                </form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="success" onClick={handleComment}>
                  Send
                </Button>
                <Button variant="danger" onClick={() => setModalShow(false)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mt-5 fs-1">
            Log in to see details of projects.
            <br />
            <Link to="/login">Login</Link>
          </div>
        </>
      )}
    </>
  );
};

export default ProjectInfromation;
