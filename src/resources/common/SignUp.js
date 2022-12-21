import React, { useEffect, useState, useContext } from "react";
import { NavLink, useHistory } from "react-router-dom";

//jQuery initialization
import $ from "jquery";

//functions
import {
  _t,
  getCookie,
  modalLoading,
  getSystemSettings,
} from "../../functions/Functions";
import { useTranslation } from "react-i18next";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../BaseUrl";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "universal-cookie";

//context consumer
import { SettingsContext } from "../../contexts/Settings";
import { UserContext } from "../../contexts/User";
import { RestaurantContext } from "../../contexts/Restaurant";
import { FoodContext } from "../../contexts/Food";

// images
import loginImg from "../../saasHelper/img/login-img.svg";

const cookies = new Cookies();

const SignUp = () => {
  const { t } = useTranslation();
  const history = useHistory();

  //getting context values here
  let {
    loading,
    setLoading,
    generalSettings,
    getSmtp,
    getPermissionGroups,
    getLanguages,
    getCurrency,
    getSettings,
  } = useContext(SettingsContext);
  let { getAuthUser, authUserInfo, getCustomer, getWaiter, getAdminStaff } =
    useContext(UserContext);
  let { getBranch, getTable, getDeptTag, getPaymentType, getWorkPeriod } =
    useContext(RestaurantContext);

  let { getFood, getFoodGroup, getPropertyGroup, getVariation } =
    useContext(FoodContext);

  //state hooks here
  const [credentials, setCredentials] = useState({
    name: null,
    email: null,
    phn_no: null,
    password: null,
    password_confirmation: null,
  });

  useEffect(() => {
    handleJquery();
    checkAuth();
  }, []);

  //jQuery
  const handleJquery = () => {
    //obj Image Animation
    var hoverLayer = $("body");
    var objImgOne = $(".fk-global-img__obj");

    //Animation Init
    hoverLayer.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 60;
      var valueY = (e.pageY * -1) / 80;
      if (objImgOne.length) {
        objImgOne.css({
          transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
        });
      }
    });
  };

  //redirect if logged in
  const checkAuth = () => {
    getCookie() !== undefined && history.replace("/dashboard");
  };

  //set credentials here on input change
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  //try for login, submit credentials to server
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = BASE_URL + "/auth/register";
    return axios
      .post(url, credentials)
      .then((res) => {
        toast.success(
          `${_t(
            t("Your registration has been successful, please login to continue")
          )}`,
          {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          }
        );
        history.push("/login");
      })
      .catch((error) => {
        console.log(error.response.data.errors);
        setLoading(false);
        if (error && error.response.data.errors) {
          if (error.response.data.errors.phn_no) {
            error.response.data.errors.phn_no.forEach((item) => {
              if (item === "An user exists with this phone number") {
                toast.error(
                  `${_t(t("An user exists with this phone number"))}`,
                  {
                    position: "bottom-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    className: "text-center toast-notification",
                  }
                );
              }
            });
          }
          if (error.response.data.errors.email) {
            error.response.data.errors.email.forEach((item) => {
              if (item === "An user exists with this email") {
                toast.error(`${_t(t("An user exists with this email"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }
          if (error.response.data.errors.password) {
            error.response.data.errors.password.forEach((item) => {
              if (item === "Password confirmation does not match") {
                toast.error(
                  `${_t(t("Password confirmation does not match"))}`,
                  {
                    position: "bottom-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    className: "text-center toast-notification",
                  }
                );
              }
              if (item === "The password must be at least 6 characters.") {
                toast.error(
                  `${_t(t("The password must be at least 6 characters"))}`,
                  {
                    position: "bottom-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    className: "text-center toast-notification",
                  }
                );
              }
            });
          }
          if (error.response.data.errors.image) {
            error.response.data.errors.image.forEach((item) => {
              if (item === "Please select a valid image file") {
                toast.error(`${_t(t("Please select a valid image file"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
              if (item === "Please select a file less than 5MB") {
                toast.error(`${_t(t("Please select a file less than 5MB"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }
        }
      });
  };

  const style = {
    logo: {
      backgroundColor: "none",
      // generalSettings &&
      // getSystemSettings(generalSettings, "type_background"),
      backgroundImage:
        generalSettings &&
        `url(${getSystemSettings(generalSettings, "type_logo")})`,
    },
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Sign Up"))}</title>
      </Helmet>
      <main>
        <div className="fk-global-access d-flex justify-content-center align-items-center">
          <div className="container-form my-md-auto">
            <div className="row h-100 m-0">
              <div className="col-12 col-md-6 bg-white form-inputs">
                {credentials.install_no ? (
                  <div className="row">
                    <div className="col-12 mt-3">
                      <div className="fk-brand fk-brand--sr-lg logo-form">
                        {window.location.pathname === "/" ? (
                          <NavLink
                            to={{ pathname: "/refresh", state: "/" }}
                            exact
                            className="t-link w-100"
                          >
                            <span className="fk-brand__img fk-brand__img--fk login-page-background"></span>
                          </NavLink>
                        ) : (
                          <NavLink to="/" className="t-link w-100">
                            <span className="fk-brand__img fk-brand__img--fk login-page-background"></span>
                          </NavLink>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="row m-0">
                    <div className="col-12 mt-3">
                      <div className="fk-brand fk-brand--sr-lg logo-form">
                        {window.location.pathname === "/" ? (
                          <NavLink
                            to={{ pathname: "/refresh", state: "/" }}
                            exact
                            className="t-link w-100"
                          >
                            <span
                              className="fk-brand__img fk-brand__img--fk"
                              style={style.logo}
                            ></span>
                          </NavLink>
                        ) : (
                          <NavLink to="/" className="t-link w-100">
                            <span
                              className="fk-brand__img fk-brand__img--fk"
                              style={style.logo}
                            ></span>
                          </NavLink>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="row m-0">
                  <div className="col-12 t-mt-50">
                    <div className="fk-global-form">
                      {loading ? (
                        <div key="login-form">
                          <h3 className="mt-0 text-capitalize font-weight-bold">
                            {_t(t("waiting for response"))}
                          </h3>
                          <form onSubmit={handleSubmit}>
                            <div className="row">
                              {modalLoading(3)}
                              <div className="col-12">
                                <div className="d-flex align-items-center">
                                  <div className="t-mr-8">
                                    <button
                                      type="button"
                                      className="btn btn-primary sm-text text-uppercase"
                                    >
                                      {_t(t("Please wait"))}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <div key="loading">
                          {!credentials.install_check_reload ? (
                            <>
                              <h3 className="mt-0 text-capitalize title-form">
                                {_t(t("sign Up"))}
                              </h3>
                              <form onSubmit={handleSubmit}>
                                <div className="row">
                                  <div className="col-12 t-mb-15">
                                    <input
                                      onChange={handleChange}
                                      type="text"
                                      name="name"
                                      placeholder="Name"
                                      value={credentials.name}
                                      required
                                      autoComplete="off"
                                      className="form-control rounded-1"
                                    />
                                  </div>

                                  <div className="col-12 t-mb-15">
                                    <input
                                      onChange={handleChange}
                                      type="email"
                                      name="email"
                                      placeholder="Email"
                                      value={credentials.email}
                                      required
                                      autoComplete="off"
                                      className="form-control rounded-1"
                                    />
                                  </div>
                                  <div className="col-12 t-mb-15">
                                    <input
                                      onChange={handleChange}
                                      type="text"
                                      name="phn_no"
                                      placeholder="Phone number"
                                      value={credentials.phn_no}
                                      required
                                      autoComplete="off"
                                      className="form-control rounded-1"
                                    />
                                  </div>
                                  <div className="col-12 t-mb-15">
                                    <input
                                      onChange={handleChange}
                                      name="password"
                                      type="password"
                                      placeholder="Password"
                                      value={credentials.password}
                                      required
                                      autoComplete="off"
                                      className="form-control rounded-1"
                                    />
                                  </div>
                                  <div className="col-12 t-mb-15">
                                    <input
                                      onChange={handleChange}
                                      name="password_confirmation"
                                      type="password"
                                      placeholder="Confirm Password"
                                      value={credentials.password_confirmation}
                                      required
                                      autoComplete="off"
                                      className="form-control rounded-1"
                                    />
                                  </div>
                                  <div className="col-12">
                                    <div className="">
                                      <div className="t-mr-8">
                                        <button
                                          type="submit"
                                          className="btn text-uppercase btn-main-form"
                                        >
                                          {_t(t("sign Up"))}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="footer-form-text text-center">
                                    {_t(t("Already have an account?"))}{" "}
                                    <NavLink
                                      to="/login"
                                      className="text-uppercase"
                                    >
                                      {_t(t("Sign In"))}
                                    </NavLink>
                                  </p>
                                </div>
                              </form>
                            </>
                          ) : (
                            modalLoading(5)
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 container-img-form p-3 d-flex align-items-center justofy-content-center d-none d-md-flex">
                <div className="image">
                  <img className="img-fluid" src={loginImg} alt="login-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SignUp;
