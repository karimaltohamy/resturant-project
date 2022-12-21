import React, { useContext, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Link, NavLink, useHistory } from "react-router-dom";
import {
  PayPalScriptProvider,
  PayPalButtons,
  BraintreePayPalButtons,
} from "@paypal/react-paypal-js";

//importing context consumer here
import { UserContext } from "../../../contexts/User";
import { FoodContext } from "../../../contexts/Food";
import { RestaurantContext } from "../../../contexts/Restaurant";
import { SettingsContext } from "../../../contexts/Settings";

// images
import imgHero from "../../../saasHelper/img/system-img.webp";
import imgElementor from "../../../saasHelper/img/elementor-img.png";
import imgInfor1 from "../../../saasHelper/img/digital-management-icon.png";
import imgInfor2 from "../../../saasHelper/img/Take-Control-icon.png";
import imgInfor3 from "../../../saasHelper/img/Integration-icon.png";
import digitalImg from "../../../saasHelper/img/digital-img.svg";
import controlImg from "../../../saasHelper/img/control-img.svg";
import IntegrationImg from "../../../saasHelper/img/Integration.svg";
import DashboardImg from "../../../saasHelper/img/dashboard-img.svg";
import billImg from "../../../saasHelper/img/bill-img.svg";
import onlineOrderImg from "../../../saasHelper/img/online-order.svg";
import websiteImg from "../../../saasHelper/img/website-img.svg";
import TableImg from "../../../saasHelper/img/table-img.svg";
import phoneScannerImg from "../../../saasHelper/img/phone-scanner-img.svg";
import paymentImg from "../../../saasHelper/img/payment-img.svg";
import humanImg from "../../../saasHelper/img/human-img.svg";
import accountImg from "../../../saasHelper/img/account-img.svg";
import delivaryImg from "../../../saasHelper/img/delivary-img.svg";
import mainPaymentImg from "../../../saasHelper/img/main-payment-img.png";
import dashboardResponImg from "../../../saasHelper/img/dashboard-respon-img.svg";
//axios and base url
import axios from "axios";
import { BASE_URL, SAAS_APPLICATION } from "../../../BaseUrl";

//functions
import {
  _t,
  modalLoading,
  restaurantMenuLink,
  getSystemSettings,
  getCookie,
  deleteCookie,
  currencySymbolLeft,
  formatPrice,
  currencySymbolRight,
} from "../../../functions/Functions";

//3rd party packages
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//jQuery initialization
import $ from "jquery";

const RestaurantLanding = () => {
  // defult lang
  const defultLang = localStorage.getItem("i18nextLng");

  const { t, i18n } = useTranslation();

  // data box digital
  const boxDigitalInfor = [
    {
      id: 1,
      title: _t(t("Digital Management")),
      desc1: _t(t("desc_col_Management")),
      desc2: _t(t("desc2_col_Management")),
      item1: _t(t("item1_management")),
      item2: _t(t("item2_management")),
      item3: _t(t("item3_management")),
      img: digitalImg,
    },
    {
      id: 2,
      title: _t(t("Take Control On Your Own Hand")),
      desc1: _t(t("desc_col_control")),
      desc2: _t(t("desc2_col_control")),
      item1: _t(t("item1_control")),
      item2: _t(t("item2_control")),
      item3: _t(t("item3_control")),
      img: controlImg,
    },
    {
      id: 3,
      title: _t(t("Integration")),
      desc1: _t(t("desc_Integration")),
      desc2: _t(t("desc2_Integration")),
      item1: _t(t("item_Integration")),
      item2: _t(t("item2_Integration")),
      item3: _t(t("item3_Integration")),
      img: IntegrationImg,
    },
  ];

  // toggle menu mobil
  const [activeMenu, setActiveMenu] = useState(false);

  // dark mode
  const [darkMode, setDarkMode] = useState(false);

  // click acrive box informatio
  const [activeInforBox, setActiveInforBox] = useState("digital");
  const [numBoxsInfor, setNumboxsInfor] = useState(0);

  const handleChangeActiveBoxInfor = (text, num) => {
    setActiveInforBox(text);
    setNumboxsInfor(num);
  };

  //getting context values here
  let {
    navLanguageList,
    navCurrencyList,
    generalSettings,
    showManageStock,
    paypal_client_id,
  } = useContext(SettingsContext);
  //auth user
  const { authUserInfo } = useContext(UserContext);
  //restaurant
  let { branchForSearch } = useContext(RestaurantContext);
  //food
  let {
    getFoodWeb,
    foodListWeb,
    foodGroupWeb,
    propertyGroupWeb,
    workPeriodWeb,
    foodStockWeb,
    setFoodStockWeb,
  } = useContext(FoodContext);

  //use state
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showVariation, setShowVariation] = useState(false);

  const [deliverymenShow, setdeliverymenShow] = useState(false);
  const [checkLoginUser, setCheckLoginUser] = useState(0);
  //
  const [defaultLang, setDefaultLang] = useState(null);
  const [defaultCurrency, setDefaultCurrency] = useState(null);

  //food and group
  const [foodItems, setFoodItems] = useState({
    list: null,
    group: null,
    selectedItem: null,
    variations: null,
    properties: null,
  });

  //new order
  const [newOrder, setNewOrder] = useState({
    variation: null,
    quantity: 1,
    properties: null,
  });

  //order details
  const [orderDetails, setOrderDetails] = useState({
    items: [],
    branch: null,
    workPeriod: null,
    workPeriodStatus: false,
    address: null, //null
    name: null,
    phn_no: null,
    note: null,
    payment_type: "COD",
    uploading: false,
  });

  // check auth user
  const checkLoginfunc = () => {
    getCookie() !== undefined ? setCheckLoginUser(0) : setCheckLoginUser(1);
  };

  //useeffect == componentDidMount()
  useEffect(() => {
    getFoodWeb();
    deliveryMenu();
    handleOnLoadDefaultLang();
    handleOnLoadDefaultCurrency();
    checkLoginfunc();

    setOrderDetails({
      ...orderDetails,
      address: authUserInfo.details && authUserInfo.details.address,
      name: authUserInfo.details && authUserInfo.details.name,
      phn_no: authUserInfo.details && authUserInfo.details.phn_no,
    });
    if (foodGroupWeb && foodListWeb) {
      let temp = foodListWeb.filter((foodItem, foodItemIndex) => {
        return parseInt(foodItem.food_group_id) === foodGroupWeb[0].id;
      });
      setFoodItems({ ...foodItems, list: temp, group: foodGroupWeb[0] });
    }
    setTimeout(() => {
      setLoading(false);
    }, 2500);
  }, [authUserInfo, navCurrencyList]);

  // deliveryman menu update
  const deliveryMenu = () => {
    const url = BASE_URL + `/settings/deliverymen-menu-info`;
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        if (res.data.length == 0 || res.data[0].value == 1) {
          setdeliverymenShow(true);
        } else {
          setdeliverymenShow(false);
        }
      });
  };

  //dynamic style
  const style = {
    logo: {
      backgroundImage:
        generalSettings &&
        `url(${getSystemSettings(generalSettings, "type_logo")})`,
    },
    currency: {
      backgroundColor:
        generalSettings && getSystemSettings(generalSettings, "type_clock"),
      color:
        generalSettings && getSystemSettings(generalSettings, "type_color"),
    },
  };

  //logout
  const handleLogout = () => {
    deleteCookie();
  };

  //orders variation
  const handleOrderItemVariation = (item) => {
    setNewOrder({
      ...newOrder,
      variation: item,
    });
  };

  //set default language on site load
  const handleOnLoadDefaultLang = () => {
    let localLang = localStorage.i18nextLng;
    if (localLang) {
      if (localLang === undefined || localLang.includes("en-")) {
        navLanguageList &&
          navLanguageList.map((item) => {
            if (item.is_default === true) {
              i18n.changeLanguage(item.code);
              setDefaultLang(item);
            }
            return true;
          });
      } else {
        const temp =
          navLanguageList &&
          navLanguageList.find((item) => {
            return item.code === localLang;
          });
        setDefaultLang(temp);
        i18n.changeLanguage(localLang);
      }
    }
  };

  //change language to selected
  const handleDefaultLang = (lang) => {
    i18n.changeLanguage(lang.code);
    setDefaultLang(lang);
    if (defultLang === "ar") {
      window.location.reload();
      document.body.style.direction = "rtl";
    } else {
      window.location.reload();
      document.body.style.direction = "ltr";
    }
    toast.success(`${_t(t("Language has been switched!"))}`, {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      className: "text-center toast-notification",
    });
  };

  //set default currency on site load
  const handleOnLoadDefaultCurrency = () => {
    let localCurrency = JSON.parse(localStorage.getItem("currency"));
    if (localCurrency === null) {
      navCurrencyList &&
        navCurrencyList.map((item) => {
          if (item.is_default === true) {
            setDefaultCurrency(item);
            localStorage.setItem("currency", JSON.stringify(item));
          }
          return true;
        });
    } else {
      const temp =
        navCurrencyList &&
        navCurrencyList.find((item) => {
          return item.code === localCurrency.code;
        });
      setDefaultCurrency(temp);
    }
  };

  //change currency to selected
  const handleDefaultCurrency = (e) => {
    let item =
      navCurrencyList &&
      navCurrencyList.find((theItem) => {
        return theItem.id === parseInt(e.target.value);
      });
    localStorage.setItem("currency", JSON.stringify(item));
    setDefaultCurrency(item);
    toast.success(`${_t(t("Currency has been changed!"))}`, {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      className: "text-center toast-notification",
    });
  };

  //get selected branch
  const getSelectedBranch = (id) => {
    if (orderDetails && orderDetails.branch !== null) {
      if (id === orderDetails.branch.id) {
        return true;
      }
    }
    return false;
  };

  //paypal integration
  const initialOptions = {
    // "client-id": { paypal_client_id },
    "client-id":
      "AWOafqislzl8zx6-w5BwIOu9p-7DXKNt3Ly4hGzXYNRYBKJkY_yrUcAYSc5RP6YFz_ckikuYoDoBs9NK",
    currency: "USD",
    intent: "capture",
  };

  // toggle dark mode
  const handleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");

    if (!darkMode) {
      localStorage.setItem("mode", "dark-mode");
    } else {
      localStorage.setItem("mode", "light-mode");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("mode") === "dark-mode") {
      document.body.classList.add("dark-mode");
      setDarkMode(true);
    } else {
      document.body.classList.remove("dark-mode");
      setDarkMode(false);
    }
  });

  return (
    <>
      <Helmet>
        <title>
          {generalSettings && getSystemSettings(generalSettings, "siteName")}
        </title>
        <link rel="stylesheet" href="/website/css/animate.css" />
        <link rel="stylesheet" href="/website/css/meanmenu.min.css" />
        <link rel="stylesheet" href="./website/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/website/css/font-awsome-all.min.css" />
        <link rel="stylesheet" href="/website/css/magnific-popup.css" />
        <link rel="stylesheet" href="/website/css/slick.css" />
        <link rel="stylesheet" href="/website/css/jquery-ui.css" />
        <link rel="stylesheet" href="/website/css/style.css" />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@2.2.0/fonts/remixicon.css"
          rel="stylesheet"
        ></link>

        <script src="/website/js/vendor/jquery-2.2.4.min.js"></script>
        <script src="/website/js/vendor/bootstrap.min.js"></script>
        <script src="./website/js/vendor/jquery.meanmenu.min.js"></script>
        <script src="/website/js/vendor/jquery.magnific-popup.min.js"></script>
        <script src="/website/js/vendor/slick.min.js"></script>
        <script src="/website/js/vendor/counterup.min.js"></script>
        <script src="/website/js/vendor/countdown.js"></script>
        <script src="/website/js/vendor/waypoints.min.js"></script>
        <script src="/website/js/vendor/jquery-ui.js"></script>
        <script src="/website/js/vendor/isotope.pkgd.min.js"></script>
        <script src="/website/js/vendor/easing.min.js"></script>
        <script src="/website/js/vendor/wow.min.js"></script>
        <script src="/website/js/simplebar.js"></script>
        <script src="/website/js/main.js"></script>
      </Helmet>

      {/* <!-- Preloader Starts --> */}
      <div className={`preloader02 ${!loading && "d-none"}`} id="preloader02">
        <div className="preloader-inner">
          <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
        </div>
      </div>

      {/* Variation and property drawer ends */}
      <div className={loading ? "d-none" : ""}>
        <header id="home">
          {/* header-bottom  */}
          <div className="header-bottom home2-header-bottom margin-top-10">
            <div className="container position-relative">
              <div className="row d-flex align-items-center justify-content-between position-relative">
                <div className="col-lg-2 col-md-2 col-sm-2 col-6">
                  <div className="logo">
                    {window.location.pathname === "/" ? (
                      <NavLink
                        to={{ pathname: "/refresh", state: "/" }}
                        exact
                        className="t-link w-100"
                        key="logokey"
                      >
                        <img
                          src={getSystemSettings(generalSettings, "type_logo")}
                          alt="logo"
                        />
                      </NavLink>
                    ) : (
                      <NavLink
                        to="/"
                        exact
                        className="t-link w-100"
                        key="logokey"
                      >
                        <img
                          src={getSystemSettings(generalSettings, "type_logo")}
                          alt="logo"
                        />
                      </NavLink>
                    )}
                  </div>
                </div>
                <div
                  className={`col-md-8 d-md-block container-menu ${
                    activeMenu ? "active-menu" : null
                  }`}
                >
                  <nav id="mobile-menu d-block">
                    <ul className="main-menu">
                      {/* {SAAS_APPLICATION == 'YES' ? <li> <Link to='#'>{_t(t("from saas"))}</Link></li> : <li> <Link to='#'>{_t(t("normal app"))}</Link></li>} */}
                      <div
                        className="close-menu"
                        onClick={() => setActiveMenu(false)}
                      >
                        <i class="ri-close-fill"></i>
                      </div>
                      <li>
                        <a
                          className={`${defultLang === "ar" && "fs-ar"}`}
                          href="#home"
                        >
                          {_t(t("home"))}
                        </a>
                      </li>
                      <li>
                        <a
                          className={`${defultLang === "ar" && "fs-ar"}`}
                          href="#services"
                        >
                          {_t(t("service"))}
                        </a>
                      </li>
                      <li>
                        <a
                          className={`${defultLang === "ar" && "fs-ar"}`}
                          href="#informations"
                        >
                          {_t(t("informations"))}
                        </a>
                      </li>
                      <li>
                        <a
                          className={`${defultLang === "ar" && "fs-ar"}`}
                          href="#features"
                        >
                          {_t(t("features"))}
                        </a>
                      </li>
                      <li className="dropdown">
                        <a
                          href="#language"
                          className={`dropdown-toggle ${
                            defultLang === "ar" && "fs-ar"
                          }`}
                          data-toggle="dropdown"
                          aria-expanded="false"
                          rel="noopener noreferrer"
                        >
                          {_t(t("Languages"))}
                        </a>

                        <ul className="dropdown-menu">
                          {navLanguageList &&
                            navLanguageList.map((item, index) => {
                              return (
                                <li key={index}>
                                  <button
                                    type="button"
                                    className={`dropdown-item sm-text text-capitalize ${
                                      defaultLang &&
                                      item.code === defaultLang.code
                                        ? "active"
                                        : ""
                                    }`}
                                    onClick={() => handleDefaultLang(item)}
                                  >
                                    {item.name}
                                  </button>
                                </li>
                              );
                            })}
                        </ul>
                      </li>
                      <li className="btn-menu-mobil">
                        {getCookie() === undefined ? (
                          <NavLink to="/login" className="btn btn-secondary">
                            {_t(t("Login"))}
                          </NavLink>
                        ) : (
                          <>
                            {authUserInfo &&
                            authUserInfo.details &&
                            authUserInfo.details.user_type !== "customer" ? (
                              <NavLink
                                to="/dashboard"
                                className="btn btn-secondary"
                              >
                                {_t(t("dashboard"))}
                              </NavLink>
                            ) : (
                              <button
                                className="btn btn-secondary"
                                onClick={handleLogout}
                              >
                                {_t(t("Logout"))}
                              </button>
                            )}
                          </>
                        )}
                      </li>
                      <li onClick={handleDarkMode} className="mode">
                        {darkMode ? (
                          <i className="ri-sun-fill"></i>
                        ) : (
                          <i className="ri-moon-fill"></i>
                        )}
                      </li>
                    </ul>
                  </nav>
                </div>
                <div className=" col-md-2 col-2 px-0">
                  <div className="customer-area2 d-flex align-items-center justify-content-center">
                    {getCookie() === undefined ? (
                      <NavLink to="/login" className="btn btn-secondary">
                        {_t(t("Login"))}
                      </NavLink>
                    ) : (
                      <>
                        {authUserInfo &&
                        authUserInfo.details &&
                        authUserInfo.details.user_type !== "customer" ? (
                          <NavLink
                            to="/dashboard"
                            className="btn btn-secondary"
                          >
                            {_t(t("dashboard"))}
                          </NavLink>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            onClick={handleLogout}
                          >
                            {_t(t("Logout"))}
                          </button>
                        )}
                      </>
                    )}
                    <div onClick={handleDarkMode} className="mode-mobil">
                      {darkMode ? (
                        <i className="ri-sun-fill"></i>
                      ) : (
                        <i className="ri-moon-fill"></i>
                      )}
                    </div>
                    <div className="icon-menu d-block d-md-none mx-3 cursor-pointer">
                      <svg
                        width="30"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                        onClick={() => setActiveMenu(!activeMenu)}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* start hero section */}
        <div className="hero-section">
          <div className="container h-100">
            <div className="row d-flex align-items-center justify-content-center h-100">
              <div className="col-12 col-md-6">
                <div
                  className={`text-hero ${defultLang === "ar" && "text-right"}`}
                >
                  <h1 className="title-hero">
                    {_t(t("title-hero1"))} <br />{" "}
                    <span>{_t(t("title-hero2"))}</span>
                  </h1>
                  <p className="desc-hero">{_t(t("desc-hero"))}</p>
                  <a className="btn btn-hero">{_t(t("btn-hero"))}</a>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="image-hero">
                  <img className="img-fluid" src={imgHero} alt="img-hero" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end hero section */}

        {/* start Services-section */}
        <div id="services" className="services-section">
          <div className="container">
            <div className="content-services">
              <h3 className="title-services">{_t(t("title-services"))}</h3>
              <p className="desc-services">{_t(t("desc-services"))}</p>
              <div className="boxs-servicses row pt-3 pt-lg-5">
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-cloud-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    {_t(t("secure"))} <br /> {_t(t("cloud"))}
                  </p>
                </div>
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-wifi-off-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    {_t(t("works"))} <br /> {_t(t("Offline"))}
                  </p>
                </div>
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-database-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    {_t(t("Real-time Reporting"))} <br /> {_t(t("Analytics"))}
                  </p>
                </div>
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-settings-2-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    {_t(t("Limitless"))} <br /> {_t(t("Integrations"))}
                  </p>
                </div>
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-shield-flash-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    {_t(t("Advanced Role"))} <br /> {_t(t("Authorization"))}
                  </p>
                </div>
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-phone-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    {_t(t("live"))} <br /> {_t(t("support"))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end Services-section */}

        {/* start elementor section */}
        <div className="elementor-section ">
          <div className="container">
            <div className="row content-elementor">
              <div
                className={`col-12 col-md-6 ${
                  defultLang === "ar" && "text-md-right"
                }`}
              >
                <h3 className="title-elementor">{_t(t("title-elementor"))}</h3>
                <p className="desc-elementor">{_t(t("desc-elementor"))}</p>
              </div>
              <div className="col-12 col-md-6">
                <div className="image-elementor">
                  <img
                    className="img-fluid"
                    src={imgElementor}
                    alt="img-elementor"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end elementor section */}

        {/* start informations section */}
        <div id="informations" className="informations-section">
          <div className="container">
            <div className="content">
              <div className="text-top m-auto text-center flex-column d-flex align-items-center">
                <span className="subTitle-infor text-center d-block">
                  {_t(t("subTitle-infor"))}
                </span>
                <h4 className="title-infor text-center">
                  {_t(t("title-infor"))}
                </h4>
              </div>
              <div className="boxs-infor row">
                <div className="col-12 col-sm-6 col-md-4">
                  <div
                    className={`box-infor d-flex align-items-center gap-3 ${
                      activeInforBox === "digital" ? "active-box" : ""
                    } `}
                    onClick={() => handleChangeActiveBoxInfor("digital", 0)}
                  >
                    <div className="image">
                      <img src={imgInfor1} alt="img-infor1" />
                    </div>
                    <div className="text">
                      <h5 className={`${defultLang === "ar" && "text-right"}`}>
                        {_t(t("Digital Management"))}
                      </h5>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <div
                    className={`box-infor d-flex align-items-center gap-3 ${
                      activeInforBox === "control" ? "active-box" : ""
                    } `}
                    onClick={() => handleChangeActiveBoxInfor("control", 1)}
                  >
                    <div className="image">
                      <img src={imgInfor2} alt="img-infor1" />
                    </div>
                    <div className="text">
                      <h5 className={`${defultLang === "ar" && "text-right"}`}>
                        {_t(t("Take Control On Your Own Hand"))}
                      </h5>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4">
                  <div
                    className={`box-infor d-flex align-items-center gap-3 ${
                      activeInforBox === "Integration" ? "active-box" : ""
                    } `}
                    onClick={() => handleChangeActiveBoxInfor("Integration", 2)}
                  >
                    <div className="image">
                      <img src={imgInfor3} alt="img-infor1" />
                    </div>
                    <div className="text">
                      <h5 className={`${defultLang === "ar" && "text-right"}`}>
                        {_t(t("Integration"))}
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-4">
                <div className="col-12 col-md-6 col-img">
                  <div className="image">
                    <img
                      className="img-fluid"
                      src={boxDigitalInfor[numBoxsInfor].img}
                      alt="digital-img"
                      style={{ width: "70%" }}
                    />
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="col-text">
                    <h4
                      className={`title-col ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      {boxDigitalInfor[numBoxsInfor].title}
                    </h4>
                    <p
                      className={`desc-col ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      {boxDigitalInfor[numBoxsInfor].desc1}
                    </p>
                    <p
                      className={`desc-col ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      {boxDigitalInfor[numBoxsInfor].desc2}
                    </p>
                    <div className="list" style={{ listStyle: "none" }}>
                      <li className="item-list">
                        <i className="ri-check-line"></i>
                        <span>{boxDigitalInfor[numBoxsInfor].item1}</span>
                      </li>
                      <li className="item-list">
                        <i className="ri-check-line"></i>
                        <span>{boxDigitalInfor[numBoxsInfor].item2}</span>
                      </li>
                      <li className="item-list">
                        <i className="ri-check-line"></i>
                        <span>{boxDigitalInfor[numBoxsInfor].item3}</span>
                      </li>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end informations section */}

        {/* start Features */}
        <div id="features" className="features-section">
          <div className="container">
            <div className="content-features">
              <h4 className="title-features">{_t(t("title-features"))}</h4>
              <div className="boxs-Features">
                <div className="box-Feature">
                  <div className="image">
                    <img src={DashboardImg} alt="dashboard-img" />
                  </div>
                  <p className="desc-box">{_t(t("Efficacious Dashboard"))}</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={billImg} alt="bill-img" />
                  </div>
                  <p className="desc-box">{_t(t("POS Billing System"))}</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={onlineOrderImg} alt="ovlineOrder-img" />
                  </div>
                  <p className="desc-box">
                    {_t(t("Online/Offline Order Management"))}
                  </p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={websiteImg} alt="website-img" />
                  </div>
                  <p className="desc-box">
                    {_t(t("Website & App Integration"))}
                  </p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={TableImg} alt="table-img" />
                  </div>
                  <p className="desc-box">
                    {_t(t("Table Reservation System"))}
                  </p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={phoneScannerImg} alt="table-img" />
                  </div>
                  <p className="desc-box">
                    {_t(t("QR Scanner or Contactless Payment"))}
                  </p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={accountImg} alt="table-img" />
                  </div>
                  <p className="desc-box">{_t(t("Account Management"))}</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={delivaryImg} alt="table-img" />
                  </div>
                  <p className="desc-box">
                    {_t(t("Multiple Delivery Method"))}
                  </p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={humanImg} alt="table-img" />
                  </div>
                  <p className="desc-box">
                    {_t(t("Human Resource Management System"))}
                  </p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={paymentImg} alt="table-img" />
                  </div>
                  <p className="desc-box">
                    {_t(t("Multiple Payment Gateway"))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end Features */}

        {/* start elementor section */}
        <div className="elementor-section ">
          <div className="container">
            <div className="row content-elementor">
              <div
                className={`col-12 col-md-6 ${
                  defultLang === "ar" && "text-md-right"
                }`}
              >
                <h3 className="title-elementor">{_t(t("title-elementor1"))}</h3>
                <p className="desc-elementor">{_t(t("desc-elementor2"))}</p>
              </div>
              <div className="col-12 col-md-6">
                <div className="image-elementor">
                  <img
                    className="img-fluid m-auto"
                    src={mainPaymentImg}
                    alt="img-elementor"
                    style={{ width: "70%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end elementor section */}

        {/* start responsibility-section */}
        <div className="responsibility-section">
          <div className="container">
            <div className="row">
              <div className="col-12 col-md-6">
                <div className="responsibility-text">
                  <h4
                    className={`title-responsibility ${
                      defultLang === "ar" && "text-right"
                    }`}
                  >
                    {_t(t("title-responsibility"))}
                  </h4>
                  <ul
                    className="list-responsibility"
                    style={{ listStyle: "none" }}
                  >
                    <li
                      className={`item-list ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      <i className="ri-check-line"></i>
                      <span>{_t(t("item1_responsibility"))}</span>
                    </li>
                    <li
                      className={`item-list ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      <i className="ri-check-line"></i>
                      <span>{_t(t("item2_responsibility"))}</span>
                    </li>
                    <li
                      className={`item-list ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      <i className="ri-check-line"></i>
                      <span>{_t(t("item3_responsibility"))}</span>
                    </li>
                    <li
                      className={`item-list ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      <i className="ri-check-line"></i>
                      <span>{_t(t("item4_responsibility"))}</span>
                    </li>
                    <li
                      className={`item-list ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      <i className="ri-check-line"></i>
                      <span>{_t(t("item5_responsibility"))}</span>
                    </li>
                    <li className="item-list">
                      <i className="ri-check-line"></i>
                      <span>{_t(t("item6_responsibility"))}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="image">
                  <img
                    src={dashboardResponImg}
                    className="img-fluid m-auto"
                    alt="dashboard-respon-img"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* end responsibility-section */}

        {/* start contact us section */}
        <div className="contactUs-section">
          <div className="container">
            <div className="row row-contact m-0">
              <div className="col-12 col-md-6 px-0">
                <div
                  className={`text-contact ${
                    defultLang === "ar"
                      ? "border-ra-ar text-right"
                      : "border-ra-en"
                  } `}
                >
                  <h4 className="title-contact">{_t(t("Request A Free"))}</h4>
                  <p className="desc-contact">{_t(t("desc_request"))}</p>
                  <ul className="list-contact" style={{ listStyle: "none" }}>
                    <li className="item-list">
                      <i className="ri-check-line"></i>
                      <span>{_t(t("item_request"))}</span>
                    </li>
                    <li className="item-list">
                      <i className="ri-check-line"></i>
                      <span>{_t(t("item2_request"))}</span>
                    </li>
                    <li className="item-list">
                      <i className="ri-check-line"></i>
                      <span>{_t(t("item3_request"))}</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-12 col-md-6 px-0">
                <form
                  className={`row m-0 ${
                    defultLang === "ar"
                      ? "border-ra-ar text-right"
                      : "border-ra-en"
                  }`}
                >
                  <div className="input-item col-12 col-md-6 px-0">
                    <label htmlFor="f-name">{_t(t("First name"))}</label>
                    <input
                      className={`${defultLang === "ar" ? "ml-2" : "mr-2"}`}
                      id="f-name"
                      type="text"
                    />
                  </div>
                  <div className="input-item col-12 col-md-6 px-0">
                    <label htmlFor="l-name">{_t(t("Last name"))}</label>
                    <input type="text" />
                  </div>
                  <div className="input-item col-12 px-0">
                    <label htmlFor="email">{_t(t("Email"))}</label>
                    <input id="email" type="text" />
                  </div>
                  <div className="input-item col-12 px-0">
                    <label htmlFor="Phone">{_t(t("Phone number"))}</label>
                    <input id="Phone" type="text" />
                  </div>
                  <div className="input-item col-12 px-0">
                    <label htmlFor="Company">{_t(t("Company name"))}</label>
                    <input id="Company" type="text" />
                  </div>
                  <div className="input-item col-12 px-0">
                    <label htmlFor="Country">{_t(t("Country Name"))}</label>
                    <input id="Country" type="text" />
                  </div>
                  <button className="btn-contact">{_t(t("submit"))}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* end contact us section */}

        {/* start footer */}
        <footer>
          <div className="container">
            <div className="row d-flex align-items-center">
              <div
                className={`col-12 col-md-9 mb-4 mb-md-0 ${
                  defultLang === "ar" && "text-right"
                }`}
              >
                <div className="content-about d-flex align-items-center gap-3">
                  <div
                    className={`logo ${defultLang === "ar" ? "border-r" : ""}`}
                  >
                    {window.location.pathname === "/" ? (
                      <NavLink
                        to={{ pathname: "/refresh", state: "/" }}
                        exact
                        className="t-link w-100"
                        key="logokey"
                      >
                        <img
                          src={getSystemSettings(generalSettings, "type_logo")}
                          alt="logo"
                        />
                      </NavLink>
                    ) : (
                      <NavLink
                        to="/"
                        exact
                        className="t-link w-100"
                        key="logokey"
                      >
                        <img
                          src={getSystemSettings(generalSettings, "type_logo")}
                          alt="logo"
                        />
                      </NavLink>
                    )}
                  </div>
                  <div>
                    <ul className="list-footer d-flex align-itens-center gap-3">
                      <li className="item-footer">{_t(t("About"))}</li>
                      <li className="item-footer">{_t(t("Contact us"))} </li>
                      <li className="item-footer">{_t(t("Career"))}</li>
                      <li className="item-footer">{_t(t("Support"))}</li>
                    </ul>
                    <p className="copy-right">
                      {" "}
                      &copy;{" "}
                      {generalSettings &&
                        getSystemSettings(generalSettings, "type_footer")}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`col-12 col-md-3 mb-4 mb-md-0 ${
                  defultLang === "ar" && "text-right"
                }`}
              >
                <div>
                  <div className="social-list">
                    <i class="ri-facebook-fill"></i>
                    <i class="ri-twitter-fill"></i>
                    <i class="ri-linkedin-box-fill"></i>
                    <i class="ri-instagram-line"></i>
                  </div>
                  <p className="email">Example@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </footer>
        {/* end footr */}

        {/* <!-- ToTop Button --> */}
        <button
          className="scrollup"
          onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          }}
        >
          <i className="fas fa-angle-up"></i>
        </button>
      </div>
    </>
  );
};

export default RestaurantLanding;
