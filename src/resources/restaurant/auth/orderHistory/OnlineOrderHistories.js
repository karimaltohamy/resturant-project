import React, { useEffect, useContext, useState, useRef } from "react";
import { NavLink } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  currencySymbolLeft,
  formatPrice,
  currencySymbolRight,
  getCookie,
  modalLoading,
  pageLoading,
  paginationLoading,
  paginationOrderHistory,
  showingDataOrderHistory,
  searchedShowingDataOrderHistory,
  getSystemSettings,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Moment from "react-moment";
import { useReactToPrint } from "react-to-print";

//importing context consumer here
import { SettingsContext } from "../../../../contexts/Settings";
import { UserContext } from "../../../../contexts/User";
import { RestaurantContext } from "../../../../contexts/Restaurant";
import { FoodContext } from "../../../../contexts/Food";

const OrderHistories = () => {
  //getting context values here
  const {
    //common
    generalSettings,
  } = useContext(SettingsContext);
  const { authUserInfo } = useContext(UserContext);

  // defult lang
  const defultLang = localStorage.getItem("i18nextLng");

  const {
    //branch
    branchForSearch,

    //order histories
    getAllOnlineOrders,
    allOnlineOrders,
    setPaginatedAllOnlineOrders,
    allOnlineOrdersForSearch,

    //pagination
    dataPaginating,
    setDataPaginating,
  } = useContext(RestaurantContext);

  const {
    //common
    loading,
    setLoading,
  } = useContext(FoodContext);

  const { t } = useTranslation();
  //print bills
  const componentRef = useRef();

  // States hook here
  //settle order
  const [checkOrderDetails, setCheckOrderDetails] = useState({
    item: null,
    settle: false,
    uploading: false,
    payment_type: null,
    payment_amount: null,
  });
  //search result
  let [searchedOrders, setSearchedOrders] = useState({
    list: null,
    searched: false,
    branch: null,
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  //useEffect == componentDidMount
  useEffect(() => {
    getAllOnlineOrders();
  }, []);

  //show price of each item in print
  const showPriceOfEachOrderItemPrint = (thisItem) => {
    let price = 0;
    let tempPropertyPrice = 0;
    if (thisItem.properties !== null) {
      let propertyItems = JSON.parse(thisItem.properties);
      propertyItems.forEach((propertyItem, thisIndex) => {
        let temp =
          propertyItem.quantity *
          propertyItem.price_per_qty *
          thisItem.quantity;
        tempPropertyPrice = tempPropertyPrice + temp;
      });
    }
    price = thisItem.price - tempPropertyPrice;
    return formatPrice(price);
  };

  //cancel order confirmation modal
  const handleDeleteOrderConfirmation = (orderGroup) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="card card-body">
            <h1>{_t(t("Are you sure?"))}</h1>
            <p className="text-center">
              {_t(t("You want to delete this order?"))}
            </p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleDeleteOrder(orderGroup);
                  onClose();
                }}
              >
                {_t(t("Yes, delete it!"))}
              </button>
              <button className="btn btn-success ml-2 px-3" onClick={onClose}>
                {_t(t("No"))}
              </button>
            </div>
          </div>
        );
      },
    });
  };

  //cancel order here
  const handleDeleteOrder = (orderGroup) => {
    let url = BASE_URL + "/settings/delete-online-order-from-history";
    let formData = {
      id: orderGroup.id,
    };
    setLoading(true);
    axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then(() => {
        setLoading(false);
        setSearchedOrders({
          ...searchedOrders,
          searched: false,
        });
        toast.success(`${_t(t("Deleted successfully"))}`, {
          position: "bottom-center",
          closeButton: false,
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      })
      .catch(() => {
        setLoading(false);
        toast.error(`${_t(t("Please try again"))}`, {
          position: "bottom-center",
          closeButton: false,
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      });
  };

  //search submitted orders here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedOrders({ ...searchedOrders, searched: false });
    } else {
      let searchedList = allOnlineOrdersForSearch.data.filter((item) => {
        //token
        let lowerCaseItemToken = JSON.stringify(item.token);

        //customer
        let lowerCaseItemCustomer = item.user_name.toLowerCase();

        //branch
        let lowerCaseItemBranch = item.branch_name.toLowerCase();
        return (
          lowerCaseItemToken.includes(searchInput) ||
          lowerCaseItemCustomer.includes(searchInput) ||
          (lowerCaseItemBranch && lowerCaseItemBranch.includes(searchInput))
        );
      });
      setSearchedOrders({
        ...searchedOrders,
        list: searchedList,
        searched: true,
      });
    }
  };

  //branch wise filter
  const handleBranchFilter = (branch) => {
    let searchInput = branch.name.toLowerCase();
    let searchedList = allOnlineOrdersForSearch.data.filter((item) => {
      //branch
      let lowerCaseItemBranch = item.branch_name.toLowerCase();
      return lowerCaseItemBranch && lowerCaseItemBranch.includes(searchInput);
    });
    setSearchedOrders({
      ...searchedOrders,
      list: searchedList,
      searched: true,
      branch,
    });
  };

  //date wise filter
  const handleDateFilter = () => {
    if (startDate !== null && endDate !== null) {
      var fromDate = startDate.toISOString();
      var toDate = endDate.toISOString();

      var fromMilliseconds = new Date(fromDate).getTime();
      var toMilliseconds = new Date(toDate).getTime() + 60 * 60 * 24 * 1000;

      let searchedList = null;
      if (searchedOrders.branch !== null) {
        searchedList = allOnlineOrdersForSearch.data.filter((item) => {
          let itemDate = new Date(item.created_at).getTime();
          return (
            itemDate >= fromMilliseconds &&
            itemDate <= toMilliseconds &&
            item.branch_name === searchedOrders.branch.name
          );
        });
      } else {
        searchedList = allOnlineOrdersForSearch.data.filter((item) => {
          let itemDate = new Date(item.created_at).getTime();

          return itemDate >= fromMilliseconds && itemDate <= toMilliseconds;
        });
      }
      setDataPaginating(true);
      setSearchedOrders({
        ...searchedOrders,
        list: searchedList,
        searched: true,
      });
      setTimeout(() => {
        setDataPaginating(false);
      }, 500);
    } else {
      toast.error(`${_t(t("Please select the dates to filter"))}`, {
        position: "bottom-center",
        closeButton: false,
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "text-center toast-notification",
      });
    }
  };

  //print here
  const handleOnlyPrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <Helmet>
        <title>{_t(t("Online Order history"))}</title>
      </Helmet>
      {/* Print bill */}
      <div className="d-none">
        <div ref={componentRef}>
          {checkOrderDetails && checkOrderDetails.item && (
            <div className="fk-print">
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <span className="d-block fk-print-text font-weight-bold text-uppercase text-center sm-text">
                      {getSystemSettings(generalSettings, "siteName")}
                      {","}
                      {checkOrderDetails.item.branch_name}
                    </span>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {checkOrderDetails.item.theBranch !== null &&
                      checkOrderDetails.item.theBranch.address
                        ? checkOrderDetails.item.theBranch.address
                        : ""}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {_t(t("call"))}:{" "}
                      {checkOrderDetails.item.theBranch !== null &&
                      checkOrderDetails.item.theBranch.phn_no
                        ? checkOrderDetails.item.theBranch.phn_no
                        : ""}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {getSystemSettings(generalSettings, "type_print_heading")}
                    </p>

                    <span className="d-block fk-print-text text-uppercase text-center lg-text myBorderTopCustomer">
                      {_t(t("Token No"))}-{checkOrderDetails.item.token}
                    </span>
                    <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize text-center">
                      {_t(t("Online Customer"))}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("date"))}:{" "}
                      <Moment format="LL">
                        {checkOrderDetails.item.created_at}
                      </Moment>
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-capitalize">
                      {checkOrderDetails.item.payment_method === "COD" &&
                        "Cash On Delivery"}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("Delivery Address"))}:{" "}
                      {checkOrderDetails.item.delivery_address}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("Contact"))}:{" "}
                      {checkOrderDetails.item.delivery_phn_no}
                    </p>
                    <table className="table mb-0 table-borderless akash-table-for-print-padding">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="fk-print-text xsm-text text-capitalize"
                          >
                            {_t(t("qty"))} {_t(t("item"))}
                          </th>
                          <th
                            scope="col"
                            className="fk-print-text xsm-text text-capitalize text-right"
                          >
                            {_t(t("T"))}.{_t(t("price"))}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.orderedItems.map(
                            (thisItem, indexThisItem) => {
                              return (
                                <tr>
                                  <td className="fk-print-text xsm-text text-capitalize">
                                    <div className="d-flex flex-wrap">
                                      <span className="d-inline-block xsm-text">
                                        -{thisItem.quantity}{" "}
                                        {thisItem.food_item}
                                        {thisItem.variation !== null &&
                                          "(" + thisItem.variation + ")"}
                                      </span>
                                    </div>

                                    {/* properties */}
                                    {thisItem.properties !== null && (
                                      <div className="d-block">
                                        {JSON.parse(thisItem.properties).map(
                                          (propertyItem, thisIndex) => {
                                            return (
                                              <span className="text-capitalize xsm-text d-inline-block mr-1">
                                                -{thisItem.quantity}
                                                {propertyItem.quantity > 1
                                                  ? "*" + propertyItem.quantity
                                                  : ""}{" "}
                                                {propertyItem.property}
                                              </span>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    <div className="d-block xsm-text">
                                      {showPriceOfEachOrderItemPrint(thisItem)}
                                    </div>

                                    {/* properties */}
                                    {thisItem.properties !== null && (
                                      <div className="d-block pt-0">
                                        {JSON.parse(thisItem.properties).map(
                                          (propertyItem, thisIndex) => {
                                            return (
                                              <div
                                                className="d-block"
                                                className={`text-capitalize xsm-text`}
                                              >
                                                <span>
                                                  {formatPrice(
                                                    thisItem.quantity *
                                                      propertyItem.quantity *
                                                      propertyItem.price_per_qty
                                                  )}
                                                  <br />
                                                </span>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                      </tbody>
                    </table>
                    <div className="myBorder"></div>
                    <table className="table mb-0 table-borderless">
                      <tbody>
                        <tr>
                          <th className="fk-print-text xsm-text text-capitalize">
                            <span className="d-block">{_t(t("total"))}</span>
                          </th>
                          <td className="fk-print-text xsm-text text-capitalize text-right">
                            {formatPrice(checkOrderDetails.item.order_bill)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {parseFloat(checkOrderDetails.item.vat) > 0 && (
                      <table className="table mb-0 table-borderless">
                        <tbody>
                          {checkOrderDetails.item.vat_system === "igst" ? (
                            <tr>
                              <th className="fk-print-text xsm-text">
                                <span className="d-block xsm-text">VAT</span>
                              </th>
                              <td className="fk-print-text xsm-text text-capitalize text-right">
                                {formatPrice(checkOrderDetails.item.vat)}
                              </td>
                            </tr>
                          ) : (
                            <>
                              <tr>
                                <th className="fk-print-text xsm-text">
                                  <span className="d-block xsm-text">CGST</span>
                                </th>
                                <td className="fk-print-text xsm-text text-capitalize text-right">
                                  {formatPrice(
                                    parseFloat(checkOrderDetails.item.cgst)
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <th className="fk-print-text xsm-text">
                                  <span className="d-block xsm-text">SGST</span>
                                </th>
                                <td className="fk-print-text xsm-text text-capitalize text-right">
                                  {formatPrice(
                                    parseFloat(checkOrderDetails.item.sgst)
                                  )}
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    )}
                    <div className="myBorder"></div>
                    <table className="table mb-0 table-borderless">
                      <tbody>
                        <tr>
                          <th className="fk-print-text xsm-text text-capitalize">
                            <span className="d-block">
                              {_t(t("grand total"))}
                            </span>
                          </th>
                          <td className="fk-print-text xsm-text text-capitalize text-right">
                            {formatPrice(checkOrderDetails.item.total_payable)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="myBorder"></div>
                    <p className="mb-0 xsm-text fk-print-text text-center text-capitalize">
                      {getSystemSettings(generalSettings, "type_print_footer")}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize text-center">
                      {_t(t("bill prepared by"))}:{" "}
                      {checkOrderDetails.item &&
                        checkOrderDetails.item.user_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settle modal */}
      <div className="modal fade" id="orderDetails" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {/* show order token on modal header */}
                  {_t(t("Order details, Token"))}: #
                  {checkOrderDetails.item && checkOrderDetails.item.token}
                </h5>
              </div>
              <button
                type="button"
                className="btn-close"
                data-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            {/* if loading true show loading effect */}
            {loading ? (
              <div className="modal-body">{modalLoading(5)}</div>
            ) : (
              <div className="modal-body">
                {checkOrderDetails.item &&
                  //show this if order is cancelled
                  parseInt(checkOrderDetails.item.is_cancelled) === 1 && (
                    <div className="text-center bg-secondary text-white py-2">
                      {_t(t("This order has been cancelled"))}
                    </div>
                  )}
                {/* show this if order settle is not true, if true show payment input field */}
                {!checkOrderDetails.settle ? (
                  <div class="col-12 filtr-item">
                    <div class="fk-order-token t-bg-white">
                      <div class="fk-order-token__body">
                        <div class="fk-addons-table">
                          <div class="fk-addons-table__head text-center">
                            {_t(t("order token"))}: #
                            {checkOrderDetails.item &&
                              checkOrderDetails.item.token}
                          </div>
                          <div class="fk-addons-table__info">
                            <div class="row g-0">
                              <div class="col-2 text-center border-right">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("S/L"))}
                                </span>
                              </div>
                              <div class="col-3 text-center border-right">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("food"))}
                                </span>
                              </div>
                              <div class="col-4 text-left pl-2 border-right">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("Additional Info"))}
                                </span>
                              </div>
                              <div class="col-2 text-center border-right">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("QTY"))}
                                </span>
                              </div>
                            </div>
                          </div>
                          {checkOrderDetails.item &&
                            checkOrderDetails.item.orderedItems.map(
                              (thisItem, indexThisItem) => {
                                return (
                                  <div class="fk-addons-table__body-row">
                                    <div class="row g-0">
                                      <div class="col-2 text-center border-right d-flex">
                                        <span class="fk-addons-table__info-text text-capitalize m-auto">
                                          {indexThisItem + 1}
                                        </span>
                                      </div>
                                      <div class="col-3 text-center border-right d-flex">
                                        <span class="fk-addons-table__info-text text-capitalize m-auto">
                                          {thisItem.food_item} (
                                          {thisItem.food_group})
                                        </span>
                                      </div>
                                      <div class="col-4 text-center border-right t-pl-10 t-pr-10">
                                        {thisItem.variation !== null && (
                                          <span class="fk-addons-table__info-text text-capitalize d-block text-left t-pt-5">
                                            <span class="font-weight-bold mr-1">
                                              {_t(t("variation"))}:
                                            </span>
                                            {thisItem.variation}
                                          </span>
                                        )}

                                        {thisItem.properties !== null && (
                                          <span class="fk-addons-table__info-text text-capitalize d-block text-left t-pb-5">
                                            <span class="font-weight-bold mr-1">
                                              {_t(t("properties"))}:
                                            </span>
                                            {JSON.parse(
                                              thisItem.properties
                                            ).map((propertyItem, thisIndex) => {
                                              if (
                                                thisIndex !==
                                                JSON.parse(thisItem.properties)
                                                  .length -
                                                  1
                                              ) {
                                                return (
                                                  propertyItem.property +
                                                  `${
                                                    propertyItem.quantity > 1
                                                      ? "(" +
                                                        propertyItem.quantity +
                                                        ")"
                                                      : ""
                                                  }` +
                                                  ", "
                                                );
                                              } else {
                                                return (
                                                  propertyItem.property +
                                                  `${
                                                    propertyItem.quantity > 1
                                                      ? "(" +
                                                        propertyItem.quantity +
                                                        ")"
                                                      : ""
                                                  }`
                                                );
                                              }
                                            })}
                                          </span>
                                        )}
                                      </div>
                                      <div class="col-2 text-center border-right d-flex">
                                        <span class="fk-addons-table__info-text text-capitalize m-auto">
                                          {thisItem.quantity}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <table className="table table-striped table-sm text-center mt-3">
                  <thead className="bg-info text-white text-uppercase">
                    <tr>
                      <th scope="col" colSpan="2">
                        {_t(t("Order details"))}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-capitalized">{_t(t("Customer"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.user_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Contact"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.delivery_phn_no}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Delivery Address"))}
                      </td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.delivery_address}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Note to rider"))}
                      </td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.note_to_rider}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Payment Method"))}
                      </td>
                      <td>
                        {checkOrderDetails.item &&
                        checkOrderDetails.item.payment_method === "COD"
                          ? "Cash On Delivery"
                          : ""}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Time To Deliver"))}
                      </td>
                      <td>
                        {checkOrderDetails.item &&
                        checkOrderDetails.item.time_to_deliver !== null
                          ? checkOrderDetails.item.time_to_deliver + " min(s)"
                          : ""}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Branch"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.branch_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Subtotal"))}</td>
                      <td>
                        {checkOrderDetails.item && (
                          <>
                            {currencySymbolLeft()}
                            {formatPrice(checkOrderDetails.item.order_bill)}
                            {currencySymbolRight()}
                          </>
                        )}
                      </td>
                    </tr>

                    {checkOrderDetails.item &&
                    checkOrderDetails.item.vat_system === "igst" ? (
                      <tr>
                        <td className="text-capitalized">{_t(t("VAT"))}</td>
                        <td>
                          {checkOrderDetails.item && (
                            <>
                              {currencySymbolLeft()}
                              {formatPrice(checkOrderDetails.item.vat)}
                              {currencySymbolRight()}
                            </>
                          )}
                        </td>
                      </tr>
                    ) : (
                      <>
                        <tr>
                          <td className="text-capitalized">{_t(t("CGST"))}</td>
                          <td>
                            {checkOrderDetails.item && (
                              <>
                                {currencySymbolLeft()}
                                {formatPrice(
                                  parseFloat(checkOrderDetails.item.cgst)
                                )}
                                {currencySymbolRight()}
                              </>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-capitalized">{_t(t("SGST"))}</td>
                          <td>
                            {checkOrderDetails.item && (
                              <>
                                {currencySymbolLeft()}
                                {formatPrice(
                                  parseFloat(checkOrderDetails.item.sgst)
                                )}
                                {currencySymbolRight()}
                              </>
                            )}
                          </td>
                        </tr>
                      </>
                    )}

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Total bill"))}
                      </td>
                      <td>
                        {checkOrderDetails.item && (
                          <>
                            {currencySymbolLeft()}
                            {formatPrice(checkOrderDetails.item.total_payable)}
                            {currencySymbolRight()}
                          </>
                        )}
                      </td>
                    </tr>
                    {checkOrderDetails.item &&
                      parseInt(checkOrderDetails.item.is_cancelled) === 1 && (
                        <tr>
                          <td className="text-capitalized">
                            {_t(t("Cancellation Reason"))}
                          </td>
                          <td>{checkOrderDetails.item.reason_of_cancel}</td>
                        </tr>
                      )}

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Delivery Man Status"))}
                      </td>
                      <td className="text-uppercase">
                        {checkOrderDetails.item &&
                        checkOrderDetails.item.delivery_status !== null
                          ? checkOrderDetails.item.delivery_status
                          : _t(t("Not Assigned"))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Settle modal Ends*/}

      {/* main body */}
      <main id="main" data-simplebar>
        <div className="container-fluid">
          <div className="row t-mt-10 gx-2">
            <div className="col-12 t-mb-30 mb-lg-0">
              {loading === true ? (
                pageLoading()
              ) : (
                <div className="t-bg-white ">
                  {/* next page data spin loading */}
                  <div className={`${dataPaginating && "loading"}`}></div>
                  {/* spin loading ends */}
                  <div className="row gx-2 align-items-center t-pt-15 t-pb-15 t-pl-15 t-pr-15 t-shadow">
                    <div className="col-12 t-mb-15">
                      <ul className="t-list fk-breadcrumb">
                        <li className="fk-breadcrumb__list">
                          <span className="t-link fk-breadcrumb__link text-uppercase">
                            {searchedOrders.searched === false
                              ? _t(t("Online Order history"))
                              : _t(t("Filtered order history"))}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="col-md-4 col-lg-3">
                      <div className="input-group">
                        <button className="btn btn-primary" type="button">
                          <i className="fa fa-search" aria-hidden="true"></i>
                        </button>
                        <div className="form-file">
                          <input
                            type="text"
                            className="form-control border-0 form-control--light-1 rounded-0"
                            placeholder={
                              _t(t("Search by token, customer, branch")) + ".."
                            }
                            onChange={handleSearch}
                          />
                        </div>
                      </div>
                    </div>
                    {/* large screen  */}
                    <div className="col-md-8 col-lg-9 t-mb-15 mb-md-0 d-none d-md-block">
                      <ul className="t-list fk-sort align-items-center justify-content-end">
                        <li class="fk-sort__list">
                          <NavLink
                            to="/dashboard/orders"
                            class="btn btn-transparent btn-secondary xsm-text text-uppercase py-2"
                          >
                            {_t(t("POS Orders"))}
                          </NavLink>
                        </li>
                        {authUserInfo.details !== null &&
                          authUserInfo.details.user_type !== "staff" && (
                            <li
                              className="fk-sort__list "
                              style={{ minWidth: "150px" }}
                            >
                              <Select
                                options={branchForSearch && branchForSearch}
                                components={makeAnimated()}
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.name}
                                className="xsm-text"
                                onChange={handleBranchFilter}
                                maxMenuHeight="200px"
                                placeholder={_t(t("Select branch")) + ".."}
                              />
                            </li>
                          )}
                        <li className="fk-sort__list ml-2">
                          <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            className="form-control xsm-text py-2"
                            placeholderText={_t(t("From date"))}
                            shouldCloseOnSelect={false}
                          />
                        </li>
                        <li className="fk-sort__list">
                          <span className="fk-sort__icon">
                            <span className="fa fa-long-arrow-right"></span>
                          </span>
                        </li>
                        <li className="fk-sort__list">
                          <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            className="form-control xsm-text py-2"
                            placeholderText={_t(t("To date"))}
                            shouldCloseOnSelect={false}
                          />
                        </li>
                        <li
                          class={`fk-sort__list ${
                            defultLang === "ar" ? "mr-2" : "mr-0"
                          }`}
                        >
                          <button
                            class="btn btn-transparent btn-danger xsm-text text-uppercase py-2"
                            onClick={handleDateFilter}
                          >
                            {_t(t("Filter"))}
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* mobile screen  */}
                    <div className="col-md-8 col-lg-9 t-mb-15 mb-md-0 d-block d-md-none">
                      <ul className="t-list fk-sort align-items-center justify-content-end">
                        <li class="fk-sort__list w-100">
                          <NavLink
                            to="/dashboard/orders"
                            class="btn btn-transparent btn-secondary xsm-text text-uppercase py-2"
                          >
                            {_t(t("POS Orders"))}
                          </NavLink>
                        </li>

                        {authUserInfo.details !== null &&
                          authUserInfo.details.user_type !== "staff" && (
                            <li
                              className="fk-sort__list w-100 mt-2"
                              style={{ minWidth: "150px" }}
                            >
                              <Select
                                options={branchForSearch && branchForSearch}
                                components={makeAnimated()}
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.name}
                                className="xsm-text w-100"
                                onChange={handleBranchFilter}
                                maxMenuHeight="200px"
                                placeholder={_t(t("Select branch")) + ".."}
                              />
                            </li>
                          )}
                        <li
                          className={`fk-sort__list w-100 ${
                            authUserInfo.details !== null &&
                            authUserInfo.details.user_type !== "staff"
                              ? ""
                              : "mt-2"
                          }`}
                        >
                          <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            className="form-control xsm-text py-2 w-100"
                            shouldCloseOnSelect={false}
                          />
                        </li>
                        <li className="fk-sort__list w-100">
                          <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            className="form-control xsm-text py-2 w-100"
                            shouldCloseOnSelect={false}
                          />
                        </li>
                        <li class="fk-sort__list w-100">
                          <button
                            class="btn btn-transparent btn-danger xsm-text text-uppercase py-2"
                            onClick={handleDateFilter}
                          >
                            {_t(t("Filter"))}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="fk-scroll--order-history" data-simplebar>
                    <div className="t-pl-15 t-pr-15">
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover min-table-height mt-4">
                          <thead className="align-middle">
                            <tr>
                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("S/L"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Token"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Date"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Customer"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Total bill"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Branch"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Status"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("print"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Action"))}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="align-middle">
                            {/* loop here, logic === !search && haveData && haveDataLegnth > 0*/}
                            {!searchedOrders.searched
                              ? [
                                  allOnlineOrders && [
                                    allOnlineOrders.data.length === 0 ? (
                                      <tr className="align-middle">
                                        <td
                                          scope="row"
                                          colSpan="10"
                                          className="xsm-text align-middle text-center"
                                        >
                                          {_t(t("No data available"))}
                                        </td>
                                      </tr>
                                    ) : (
                                      allOnlineOrders.data.map(
                                        (item, index) => {
                                          return (
                                            <tr
                                              className="align-middle"
                                              key={index}
                                            >
                                              <th
                                                scope="row"
                                                className="xsm-text text-capitalize align-middle text-center"
                                              >
                                                {index +
                                                  1 +
                                                  (allOnlineOrders.meta
                                                    .current_page -
                                                    1) *
                                                    allOnlineOrders.meta
                                                      .per_page}
                                              </th>

                                              <td className="xsm-text text-capitalize align-middle text-center text-secondary">
                                                #{item.token}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <Moment format="LLL">
                                                  {item.created_at}
                                                </Moment>
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.user_name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(
                                                  item.total_payable
                                                )}
                                                {currencySymbolRight()}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.branch_name || "-"}
                                              </td>

                                              <td class="xsm-text text-capitalize align-middle text-center">
                                                {parseInt(item.is_cancelled) ===
                                                0 ? (
                                                  [
                                                    parseInt(
                                                      item.is_accepted
                                                    ) === 0 ? (
                                                      <span
                                                        className="btn btn-transparent btn-secondary xsm-text text-capitalize"
                                                        onClick={() => {
                                                          setCheckOrderDetails({
                                                            ...checkOrderDetails,
                                                            item: item,
                                                            settle: false,
                                                            cancel: false,
                                                          });
                                                        }}
                                                        data-toggle="modal"
                                                        data-target="#orderDetails"
                                                      >
                                                        {_t(t("Pending"))}
                                                      </span>
                                                    ) : (
                                                      <span
                                                        className="btn btn-transparent btn-success xsm-text text-capitalize"
                                                        onClick={() => {
                                                          setCheckOrderDetails({
                                                            ...checkOrderDetails,
                                                            item: item,
                                                            settle: false,
                                                            cancel: false,
                                                          });
                                                        }}
                                                        data-toggle="modal"
                                                        data-target="#orderDetails"
                                                      >
                                                        {_t(t("Accepted"))}
                                                      </span>
                                                    ),
                                                  ]
                                                ) : (
                                                  <span
                                                    className="btn btn-transparent btn-primary xsm-text text-capitalize px-3"
                                                    onClick={() => {
                                                      setCheckOrderDetails({
                                                        ...checkOrderDetails,
                                                        item: item,
                                                        settle: false,
                                                        cancel: false,
                                                      });
                                                    }}
                                                    data-toggle="modal"
                                                    data-target="#orderDetails"
                                                  >
                                                    {_t(t("Cancelled"))}
                                                  </span>
                                                )}
                                              </td>
                                              <td className="xsm-text align-middle text-center">
                                                <button
                                                  className="btn btn-secondary btn-sm"
                                                  onClick={() => {
                                                    setCheckOrderDetails({
                                                      ...checkOrderDetails,
                                                      item: item,
                                                      settle: false,
                                                    });
                                                    handleOnlyPrint();
                                                  }}
                                                >
                                                  <i className="fa fa-print"></i>
                                                </button>
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                <div className="dropdown text-capitalize">
                                                  <button
                                                    className="btn t-bg-clear t-text-dark--light-40"
                                                    type="button"
                                                    data-toggle="dropdown"
                                                  >
                                                    <i className="fa fa-ellipsis-h"></i>
                                                  </button>
                                                  <div className="dropdown-menu">
                                                    <button
                                                      className="dropdown-item sm-text text-capitalize"
                                                      onClick={() => {
                                                        handleDeleteOrderConfirmation(
                                                          item
                                                        );
                                                      }}
                                                    >
                                                      <span className="t-mr-8">
                                                        <i className="fa fa-trash"></i>
                                                      </span>
                                                      {_t(t("Delete Order"))}
                                                    </button>
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )
                                    ),
                                  ],
                                ]
                              : [
                                  /* searched data, logic === haveData*/
                                  searchedOrders && [
                                    searchedOrders.list.length === 0 ? (
                                      <tr className="align-middle">
                                        <td
                                          scope="row"
                                          colSpan="10"
                                          className="xsm-text align-middle text-center"
                                        >
                                          {_t(t("No data available"))}
                                        </td>
                                      </tr>
                                    ) : (
                                      searchedOrders.list.map((item, index) => {
                                        return (
                                          <tr
                                            className="align-middle"
                                            key={index}
                                          >
                                            <th
                                              scope="row"
                                              className="xsm-text text-capitalize align-middle text-center"
                                            >
                                              {index +
                                                1 +
                                                (allOnlineOrders.meta
                                                  .current_page -
                                                  1) *
                                                  allOnlineOrders.meta.per_page}
                                            </th>

                                            <td className="xsm-text text-capitalize align-middle text-center text-secondary">
                                              #{item.token}
                                            </td>

                                            <td className="xsm-text text-capitalize align-middle text-center">
                                              <Moment format="LLL">
                                                {item.created_at}
                                              </Moment>
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {item.user_name}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {currencySymbolLeft()}
                                              {formatPrice(item.total_payable)}
                                              {currencySymbolRight()}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {item.branch_name || "-"}
                                            </td>

                                            <td class="xsm-text text-capitalize align-middle text-center">
                                              {parseInt(item.is_cancelled) ===
                                              0 ? (
                                                [
                                                  parseInt(item.is_accepted) ===
                                                  0 ? (
                                                    <span
                                                      className="btn btn-transparent btn-secondary xsm-text text-capitalize"
                                                      onClick={() => {
                                                        setCheckOrderDetails({
                                                          ...checkOrderDetails,
                                                          item: item,
                                                          settle: false,
                                                          cancel: false,
                                                        });
                                                      }}
                                                      data-toggle="modal"
                                                      data-target="#orderDetails"
                                                    >
                                                      {_t(t("Pending"))}
                                                    </span>
                                                  ) : (
                                                    <span
                                                      className="btn btn-transparent btn-success xsm-text text-capitalize"
                                                      onClick={() => {
                                                        setCheckOrderDetails({
                                                          ...checkOrderDetails,
                                                          item: item,
                                                          settle: false,
                                                          cancel: false,
                                                        });
                                                      }}
                                                      data-toggle="modal"
                                                      data-target="#orderDetails"
                                                    >
                                                      {_t(t("Accepted"))}
                                                    </span>
                                                  ),
                                                ]
                                              ) : (
                                                <span
                                                  className="btn btn-transparent btn-primary xsm-text text-capitalize px-3"
                                                  onClick={() => {
                                                    setCheckOrderDetails({
                                                      ...checkOrderDetails,
                                                      item: item,
                                                      settle: false,
                                                      cancel: false,
                                                    });
                                                  }}
                                                  data-toggle="modal"
                                                  data-target="#orderDetails"
                                                >
                                                  {_t(t("Cancelled"))}
                                                </span>
                                              )}
                                            </td>
                                            <td className="xsm-text align-middle text-center">
                                              <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => {
                                                  setCheckOrderDetails({
                                                    ...checkOrderDetails,
                                                    item: item,
                                                    settle: false,
                                                  });
                                                  handleOnlyPrint();
                                                }}
                                              >
                                                <i className="fa fa-print"></i>
                                              </button>
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              <div className="dropdown text-capitalize">
                                                <button
                                                  className="btn t-bg-clear t-text-dark--light-40"
                                                  type="button"
                                                  data-toggle="dropdown"
                                                >
                                                  <i className="fa fa-ellipsis-h"></i>
                                                </button>
                                                <div className="dropdown-menu">
                                                  <button
                                                    className="dropdown-item sm-text text-capitalize"
                                                    onClick={() => {
                                                      handleDeleteOrderConfirmation(
                                                        item
                                                      );
                                                    }}
                                                  >
                                                    <span className="t-mr-8">
                                                      <i className="fa fa-trash"></i>
                                                    </span>
                                                    {_t(t("Delete Order"))}
                                                  </button>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ),
                                  ],
                                ]}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* pagination loading effect */}
              {loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedOrders.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {paginationOrderHistory(
                                allOnlineOrders,
                                setPaginatedAllOnlineOrders
                              )}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingDataOrderHistory(allOnlineOrders)}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // if searched
                      <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                        <div className="row align-items-center t-pl-15 t-pr-15">
                          <div className="col-md-7 t-mb-15 mb-md-0">
                            <ul className="t-list d-flex">
                              <li className="t-list__item no-pagination-style">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    setSearchedOrders({
                                      ...searchedOrders,
                                      searched: false,
                                      branch: null,
                                    });
                                    setStartDate(null);
                                    setEndDate(null);
                                  }}
                                >
                                  {_t(t("Clear Search"))}
                                </button>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-5">
                            <ul className="t-list d-flex justify-content-md-end align-items-center">
                              <li className="t-list__item">
                                <span className="d-inline-block sm-text">
                                  {searchedShowingDataOrderHistory(
                                    searchedOrders,
                                    allOnlineOrdersForSearch
                                  )}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ),
                  ]}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default OrderHistories;
