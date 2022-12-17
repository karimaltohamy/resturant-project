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

  // data box digital
  const boxDigitalInfor = [
    {
      id: 1,
      title: "Digital Management",
      desc1: `Those days are over when people used to manage their cafe
      manually.Now it's the era of digital technology, everyone
      has their own smart technology on their hands. Thus
      expects the same advanced and technical service from
      everyone.`,
      desc2: `And to catch this digital pace, your restaurant must adopt
      digital management technology. Restora POS offers exactly
      what your want:`,
      item1: `User-friendly interface`,
      item2: `Straightforward management system`,
      item3: `Smooth and fast billing system`,
      img: digitalImg,
    },
    {
      id: 2,
      title: "Take Control On Your Own Hand",
      desc1: `You can eliminate all the stress and tension of “not having a strong control and management system” in your cafe. Now you can not only monitor but also control and record all the data.`,
      desc2: `With Restora POS, you can get all-in one solution for all your management related operations in your cafe, no matter what size and type your cafe is. Easy managerial system for your cafe.:`,
      item1: `Better control on the operational cost`,
      item2: `Eliminate the possibilities of theft`,
      item3: `Heads-up about monthly/yearly sales; with graphical presentation`,
      img: controlImg,
    },
    {
      id: 3,
      title: "Integration",
      desc1: `5Code, quite strongly integrated with Website, App and Third party delivery companies. Moreover with this powerful integration your cafe can enrich the online visibility, establish the brand, and of course higher customer reach.`,
      desc2: `This integration system opens up the opportunity to manage, record and control all the synchronization of the payment data ,order data, customer data, accounts data and optimize a chronological workflow at no-time.`,
      item1: `Powerful integration with website, app and third party`,
      item2: `Raise-up the customer engagement`,
      item3: `Make your website globally ranked`,
      img: IntegrationImg,
    },
  ];

  const { t, i18n } = useTranslation();

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
  const handleDefaultLang = (e) => {
    let lang =
      navLanguageList &&
      navLanguageList.find((theItem) => {
        return theItem.id === parseInt(e.target.value);
      });
    i18n.changeLanguage(lang.code);
    setDefaultLang(lang);
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
                  className={`col-md-7 d-md-block container-menu ${
                    activeMenu ? "active-menu" : null
                  }`}
                >
                  <nav id="mobile-menu d-block">
                    <ul className="main-menu main-menu2">
                      {/* {SAAS_APPLICATION == 'YES' ? <li> <Link to='#'>{_t(t("from saas"))}</Link></li> : <li> <Link to='#'>{_t(t("normal app"))}</Link></li>} */}
                      <li>
                        <a href="#home">home</a>
                      </li>
                      <li>
                        <a href="#services">Services</a>
                      </li>
                      <li>
                        <a href="#informations">Informations</a>
                      </li>
                      <li>
                        <a href="#features">Features</a>
                      </li>
                      <li>
                        <a href="#language">{_t(t("Language"))}</a>
                      </li>
                      <li onClick={handleDarkMode}>
                        {darkMode ? (
                          <i className="ri-sun-fill"></i>
                        ) : (
                          <i className="ri-moon-fill"></i>
                        )}
                      </li>
                    </ul>
                  </nav>
                </div>
                <div className=" col-md-3 col-5 px-0">
                  <div className="customer-area2 d-flex align-items-center justify-content-center">
                    {getCookie() === undefined ? (
                      <NavLink to="/login" className=" btn-secondary">
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
                            {_t(t("Dashboard"))}
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
                    <div
                      className="icon-menu d-block d-md-none mx-3 cursor-pointer"
                      onClick={() => setActiveMenu(!activeMenu)}
                    >
                      <svg
                        width="30"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
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
                    5Code Serves You <br /> <span>Coffe Pos System</span>
                  </h1>
                  <p className="desc-hero">
                    You pillar up your Coffe with bricks & concrete and we
                    polish it up with technological intelligence.
                  </p>
                  <a className="btn btn-hero">Start Your Journey</a>
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
              <h3 className="title-services">Smart. Simple. Secure.</h3>
              <p className="desc-services">
                Elevate your Café guests experience and business operations with
                5Code
              </p>
              <div className="boxs-servicses row pt-3 pt-lg-5">
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-cloud-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    Secure <br /> Cloud
                  </p>
                </div>
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-wifi-off-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    Works <br /> Offline
                  </p>
                </div>
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-database-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    Real-time Reporting <br /> & Analytics
                  </p>
                </div>
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-settings-2-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    Limitless <br /> Integrations
                  </p>
                </div>
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-shield-flash-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    Advanced Role <br /> Authorization
                  </p>
                </div>
                <div className="box-services col-6 col-md-4 col-lg-2">
                  <div className="image text-center">
                    <i className="ri-phone-line"></i>
                  </div>
                  <p className="text-white fs-2 text-center">
                    Live <br /> Support
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
                <h3 className="title-elementor">
                  Point of Sale & Cafe Management Solution
                </h3>
                <p className="desc-elementor">
                  Manage your front of house with ease, flexibility, and
                  precision.
                </p>
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
                  Don't Worry!!!
                </span>
                <h4 className="title-infor text-center">
                  As Long as You Are With 5Code Your Cafe Business is on Safe
                  Hand
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
                        Digital Management
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
                        Take Control On Your Own Hand
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
                        Integration
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
              <h4 className="title-features">
                Bake Your Cafe With Our Raw Features
              </h4>
              <div className="boxs-Features">
                <div className="box-Feature">
                  <div className="image">
                    <img src={DashboardImg} alt="dashboard-img" />
                  </div>
                  <p className="desc-box">Efficacious Dashboard</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={billImg} alt="bill-img" />
                  </div>
                  <p className="desc-box">POS Billing System</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={onlineOrderImg} alt="ovlineOrder-img" />
                  </div>
                  <p className="desc-box">Online/Offline Order Management</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={websiteImg} alt="website-img" />
                  </div>
                  <p className="desc-box">Website & App Integration</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={TableImg} alt="table-img" />
                  </div>
                  <p className="desc-box">Table Reservation System</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={phoneScannerImg} alt="table-img" />
                  </div>
                  <p className="desc-box">QR Scanner or Contactless Payment</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={accountImg} alt="table-img" />
                  </div>
                  <p className="desc-box">Account Management</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={delivaryImg} alt="table-img" />
                  </div>
                  <p className="desc-box">Multiple Delivery Method</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={humanImg} alt="table-img" />
                  </div>
                  <p className="desc-box">Human Resource Management System</p>
                </div>
                <div className="box-Feature">
                  <div className="image">
                    <img src={paymentImg} alt="table-img" />
                  </div>
                  <p className="desc-box">Multiple Payment Gateway</p>
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
                <h3 className="title-elementor">Payment Solution</h3>
                <p className="desc-elementor">
                  MGive your customers a fast and secure checkout experience by
                  your Cashier App.
                </p>
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
                    Your Dream, Our Responsibility
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
                      <span>
                        Interactive dashboard to compare your sales or cost,
                        with graphical presentation
                      </span>
                    </li>
                    <li
                      className={`item-list ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      <i className="ri-check-line"></i>
                      <span>
                        Secure transaction with multiple payment gateways
                      </span>
                    </li>
                    <li
                      className={`item-list ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      <i className="ri-check-line"></i>
                      <span>Smooth and fast POS billing system for cafe</span>
                    </li>
                    <li
                      className={`item-list ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      <i className="ri-check-line"></i>
                      <span>Contactless or QR scanner payment</span>
                    </li>
                    <li
                      className={`item-list ${
                        defultLang === "ar" && "text-right"
                      }`}
                    >
                      <i className="ri-check-line"></i>
                      <span>Better control of human resourse</span>
                    </li>
                    <li className="item-list">
                      <i className="ri-check-line"></i>
                      <span>Online/offline-order management</span>
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
                  <h4 className="title-contact">Request a free </h4>
                  <p className="desc-contact">
                    Let us help you get started with the right tools for your
                    business.
                  </p>
                  <ul className="list-contact" style={{ listStyle: "none" }}>
                    <li className="item-list">
                      <i className="ri-check-line"></i>
                      <span>
                        Fill out the form and a 5Code specialist will reach out
                        to you within 24 hours to schedule your demo.
                      </span>
                    </li>
                    <li className="item-list">
                      <i className="ri-check-line"></i>
                      <span>
                        Your demo will include a customized walkthrough of 5Code
                        catered to your cafe's unique needs.
                      </span>
                    </li>
                    <li className="item-list">
                      <i className="ri-check-line"></i>
                      <span>
                        We’ll follow up with a price quote built just for you
                        based on your ideal hardware and software.
                      </span>
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
                    <label htmlFor="f-name">First name</label>
                    <input
                      className={`${defultLang === "ar" ? "ml-2" : "mr-2"}`}
                      id="f-name"
                      type="text"
                    />
                  </div>
                  <div className="input-item col-12 col-md-6 px-0">
                    <label htmlFor="l-name">Last name</label>
                    <input type="text" />
                  </div>
                  <div className="input-item col-12 px-0">
                    <label htmlFor="email">Email</label>
                    <input id="email" type="text" />
                  </div>
                  <div className="input-item col-12 px-0">
                    <label htmlFor="Phone">Phone number</label>
                    <input id="Phone" type="text" />
                  </div>
                  <div className="input-item col-12 px-0">
                    <label htmlFor="Company">Company name</label>
                    <input id="Company" type="text" />
                  </div>
                  <div className="input-item col-12 px-0">
                    <label htmlFor="Country">Country Name</label>
                    <input id="Country" type="text" />
                  </div>
                  <button className="btn-contact">submit</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        {/* end contact us section */}

        {/* start footer */}
        <footer>
          <div className="container">
            <div className="row">
              <div
                className={`col-12 col-md-6 col-lg-3 mb-4 mb-md-0 ${
                  defultLang === "ar" && "text-right"
                }`}
              >
                <div className="content-about">
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
                  <p className="address">Mannan Plaza, Khilkhet,</p>
                  <p className="address">Dhaka-1229, Bangladesh</p>
                  <span className="info-about">
                    Email: <p>info@exampil.com</p>
                  </span>
                  <span className="info-about">
                    Phone: <p>01004632317</p>
                  </span>
                  <div className="social-content">
                    <h5>Stay In Touch</h5>
                    <div className="social">
                      <a href="#">
                        <i className="ri-twitter-fill twitter"></i>
                      </a>
                      <a href="#">
                        <i className="ri-facebook-fill facebook"></i>
                      </a>
                      <a href="#">
                        <i className="ri-instagram-line instagram"></i>
                      </a>
                      <a href="#">
                        <i className="ri-linkedin-box-line linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`col-12 col-md-6 col-lg-3 mb-4 mb-md-0 ${
                  defultLang === "ar" && "text-right"
                }`}
              >
                <ul className="list-footer">
                  <h5 className="title-list">Product</h5>
                  <h6>Automation</h6>
                  <li>Cafe Management Software</li>
                  <li>Cafe Inventory Management Software</li>
                  <h6>Dynamism</h6>
                  <li>Cafe POS Software</li>
                  <li>Cafe Reservation System</li>
                  <h6>Enrichment</h6>
                  <li>Online Food Ordering System</li>
                  <li>Cloud Kitchen Software</li>
                </ul>
              </div>
              <div
                className={`col-12 col-md-6 col-lg-3 mb-4 mb-md-0 ${
                  defultLang === "ar" && "text-right"
                }`}
              >
                <ul className="list-footer">
                  <h5 className="title-list">Business Types</h5>
                  <li>Bakery & Confectioneries</li>
                  <li>Food Courts</li>
                  <li>Burger & Sandwich Shop</li>
                  <li>Pizza Restaurant</li>
                  <li>Cloud Kitchen</li>
                  <li>Fine Dine Restaurant</li>
                  <li>Cafe / Coffee Shop</li>
                  <li>Seafood Restaurant</li>
                  <li>Food Truck</li>
                  <li>Franchise management</li>
                  <li>Quick Service Restaurant</li>
                </ul>
              </div>
              <div
                className={`col-12 col-md-6 col-lg-3 mb-4 mb-md-0 ${
                  defultLang === "ar" && "text-right"
                }`}
              >
                <ul className="list-footer">
                  <h5 className="title-list">Quick Links</h5>
                  <li>Who We Are</li>
                  <li>Pricing</li>
                  <li>Terms & Conditions</li>
                  <li>Privacy Policies</li>
                  <li>Contact Us</li>
                </ul>
              </div>
            </div>
            <p className="copy-right text-white fs-2 text-center mt-5">
              &copy;{" "}
              {generalSettings &&
                getSystemSettings(generalSettings, "type_footer")}
            </p>
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
