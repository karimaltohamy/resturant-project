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
    getAllOrders,
    allOrders,
    setPaginatedAllOrders,
    allOrdersForSearch,

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
    getAllOrders();
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
    let url = BASE_URL + "/settings/delete-order-from-history";
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
      let searchedList = allOrdersForSearch.data.filter((item) => {
        //token
        let lowerCaseItemToken = JSON.stringify(item.token.id);

        //customer
        let lowerCaseItemCustomer = item.customer_name.toLowerCase();

        //table
        let lowerCaseItemTable = item.table_name.toLowerCase();

        //branch
        let lowerCaseItemBranch = item.branch_name.toLowerCase();
        return (
          lowerCaseItemToken.includes(searchInput) ||
          lowerCaseItemCustomer.includes(searchInput) ||
          lowerCaseItemTable.includes(searchInput) ||
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
    let searchedList = allOrdersForSearch.data.filter((item) => {
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
        searchedList = allOrdersForSearch.data.filter((item) => {
          let itemDate = new Date(item.created_at).getTime();
          return (
            itemDate >= fromMilliseconds &&
            itemDate <= toMilliseconds &&
            item.branch_name === searchedOrders.branch.name
          );
        });
      } else {
        searchedList = allOrdersForSearch.data.filter((item) => {
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
        <title>{_t(t("Order history"))}</title>
      </Helmet>
      {/* Print bill */}
      <div className="d-none">
        <div ref={componentRef} className="d-flex justify-content-center">
          {checkOrderDetails && checkOrderDetails.item && (
            // <div className="fk-print px-3">
            //   <div className="container">
            //     <div className="row">
            //       <div className="col-12">
            //         <div className="d-flex align-items-center justify-content-center">
            //           <span
            //             className="d-block fk-print-text font-weight-bold text-uppercase text-center lg-text mb-2 py-2 "
            //             style={{
            //               width: "fit-content",
            //               borderTop: "1px dashed black",
            //               borderBottom: "1px dashed black",
            //             }}
            //           >
            //             {getSystemSettings(generalSettings, "siteName")}
            //             {","}
            //             {checkOrderDetails.item.branch_name}
            //           </span>
            //         </div>

            //         <p className="d-block fk-print-text font-weight-bold text-uppercase text-center fs-1 mt-2">
            //           CASH RECEIPT
            //         </p>

            //         {/* <p className=" sm-text fk-print-text text-center text-capitalize mb-2">
            //           {checkOrderDetails.item.theBranch !== null &&
            //           checkOrderDetails.item.theBranch.address
            //             ? checkOrderDetails.item.theBranch.address
            //             : ""}
            //         </p>
            //         <p className=" sm-text fk-print-text text-center text-capitalize mb-2">
            //           {_t(t("call"))}:{" "}
            //           {checkOrderDetails.item.theBranch !== null &&
            //           checkOrderDetails.item.theBranch.phn_no
            //             ? checkOrderDetails.item.theBranch.phn_no
            //             : ""}
            //         </p> */}
            //         {/* <p className="sm-text fk-print-text text-center text-capitalize mb-2">
            //           {getSystemSettings(generalSettings, "type_print_heading")}
            //         </p> */}
            //         {/* <span className="d-block fk-print-text text-uppercase text-center lg-text  mt-2 mb-2">
            //           {_t(t("Token No"))}-{checkOrderDetails.item.token.id}
            //         </span>

            //         <p className=" fk-print-text text-capitalize lg-text text-center mb-2 ">
            //           {checkOrderDetails.item.dept_tag_name}
            //         </p>
            //         <p className="fk-print-text text-capitalize lg-text text-center mb-2">
            //           {checkOrderDetails.dept_tag_name}
            //         </p>
            //         <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize text-center mb-3">
            //           {_t(t("Customer Copy"))}
            //         </p> */}

            //         <div
            //           className="d-flex align-items-center justify-content-between pb-2 "
            //           style={{ borderBottom: "1px dashed black" }}
            //         >
            //           <p className="mb-0 xsm-text fk-print-text text-capitalize mb-2">
            //             {_t(t("date"))}:{" "}
            //             <Moment format="LL">
            //               {checkOrderDetails.item.created_at}
            //             </Moment>
            //             {", "}
            //             <Moment format="LT">
            //               {checkOrderDetails.item.token.time}
            //             </Moment>
            //           </p>
            //           <p className="mb-0 xsm-text fk-print-text text-capitalize mb-2">
            //             {_t(t("Total guests"))}:{" "}
            //             {checkOrderDetails.item.total_guest}
            //           </p>
            //         </div>

            //         {/* {checkOrderDetails.item.waiter_name !== "-" && (
            //           <p className="mb-0 xsm-text fk-print-text text-capitalize">
            //             {_t(t("waiter name"))}:{" "}
            //             {checkOrderDetails.item.waiter_name}
            //           </p>
            //         )} */}

            //         {/* <p className="mb-0 sm-text fk-print-text text-capitalize md-text mt-2">
            //           NOT PAID
            //         </p> */}

            //         <table
            //           className="table mb-0 table-borderless akash-table-for-print-padding mt-3 mb-3"
            //           style={{ borderBottom: "1px dashed black" }}
            //         >
            //           <thead className="mb-2">
            //             <tr>
            //               <th
            //                 scope="col"
            //                 className="fk-print-text md-text text-capitalize md-text"
            //               >
            //                 {_t(t("qty"))} {_t(t("item"))}
            //               </th>
            //               <th
            //                 scope="col"
            //                 className="fk-print-text md-text text-capitalize text-right md-text"
            //               >
            //                 {_t(t("T"))}.{_t(t("price"))}
            //               </th>
            //             </tr>
            //           </thead>
            //           <tbody>
            //             {checkOrderDetails.item &&
            //               checkOrderDetails.item.orderedItems.map(
            //                 (thisItem, indexThisItem) => {
            //                   return (
            //                     <tr>
            //                       <td className="fk-print-text md-text text-capitalize mb-1">
            //                         <div className="d-flex flex-wrap">
            //                           <span className="d-inline-block xsm-text">
            //                             -{thisItem.quantity}{" "}
            //                             {thisItem.food_item}
            //                             {thisItem.variation !== null &&
            //                               "(" + thisItem.variation + ")"}
            //                           </span>
            //                         </div>

            //                         {/* properties */}
            //                         {thisItem.properties !== null && (
            //                           <div className="d-block">
            //                             {JSON.parse(thisItem.properties).map(
            //                               (propertyItem, thisIndex) => {
            //                                 return (
            //                                   <span className="text-capitalize xsm-text d-inline-block mr-1">
            //                                     -{thisItem.quantity}
            //                                     {propertyItem.quantity > 1
            //                                       ? "*" + propertyItem.quantity
            //                                       : ""}{" "}
            //                                     {propertyItem.property}
            //                                   </span>
            //                                 );
            //                               }
            //                             )}
            //                           </div>
            //                         )}
            //                       </td>
            //                       <td className="fk-print-text md-text text-capitalize text-right mb-1">
            //                         <div className="d-block xsm-text">
            //                           {showPriceOfEachOrderItemPrint(thisItem)}
            //                         </div>

            //                         {/* properties */}
            //                         {thisItem.properties !== null && (
            //                           <div className="d-block pt-0">
            //                             {JSON.parse(thisItem.properties).map(
            //                               (propertyItem, thisIndex) => {
            //                                 return (
            //                                   <div
            //                                     className="d-block"
            //                                     className={`text-capitalize xsm-text`}
            //                                   >
            //                                     <span>
            //                                       {formatPrice(
            //                                         thisItem.quantity *
            //                                           propertyItem.quantity *
            //                                           propertyItem.price_per_qty
            //                                       )}
            //                                       <br />
            //                                     </span>
            //                                   </div>
            //                                 );
            //                               }
            //                             )}
            //                           </div>
            //                         )}
            //                       </td>
            //                     </tr>
            //                   );
            //                 }
            //               )}
            //           </tbody>
            //         </table>

            //         {/* <div className="myBorder"></div> */}
            //         <table className="table mb-0 table-borderless">
            //           <tbody>
            //             <tr>
            //               <th className="fk-print-text lg-text text-capitalize">
            //                 <span className="d-block">{_t(t("total"))}</span>
            //               </th>
            //               <td className="fk-print-text lg-text text-capitalize text-right">
            //                 {formatPrice(checkOrderDetails.item.order_bill)}
            //               </td>
            //             </tr>
            //           </tbody>
            //         </table>

            //         {parseFloat(checkOrderDetails.item.vat) > 0 && (
            //           <table className="table mb-0 table-borderless">
            //             <tbody>
            //               {checkOrderDetails.item.vat_system === "igst" ? (
            //                 <tr>
            //                   <th className="fk-print-text md-text">
            //                     <span className="d-block xsm-text">VAT</span>
            //                   </th>
            //                   <td className="fk-print-text xsm-text text-capitalize text-right">
            //                     {formatPrice(checkOrderDetails.item.vat)}
            //                   </td>
            //                 </tr>
            //               ) : (
            //                 <>
            //                   <tr>
            //                     <th className="fk-print-text xsm-text">
            //                       <span className="d-block xsm-text">CGST</span>
            //                     </th>
            //                     <td className="fk-print-text xsm-text text-capitalize text-right">
            //                       {formatPrice(
            //                         parseFloat(checkOrderDetails.item.cgst)
            //                       )}
            //                     </td>
            //                   </tr>
            //                   <tr>
            //                     <th className="fk-print-text md-text">
            //                       <span className="d-block xsm-text">SGST</span>
            //                     </th>
            //                     <td className="fk-print-text xsm-text text-capitalize text-right">
            //                       {formatPrice(
            //                         parseFloat(checkOrderDetails.item.sgst)
            //                       )}
            //                     </td>
            //                   </tr>
            //                 </>
            //               )}
            //             </tbody>
            //           </table>
            //         )}

            //         {getSystemSettings(generalSettings, "sDiscount") ===
            //           "flat" && (
            //           <>
            //             {parseFloat(checkOrderDetails.item.service_charge) >
            //               0 && (
            //               <table className="table mb-0 table-borderless">
            //                 <tbody>
            //                   <tr>
            //                     <th className="fk-print-text xsm-text text-capitalize">
            //                       <span className="d-block">
            //                         {_t(t("S.Charge"))}
            //                       </span>
            //                     </th>

            //                     <td className="fk-print-text xsm-text text-capitalize text-right">
            //                       {formatPrice(
            //                         checkOrderDetails.item.service_charge
            //                       )}
            //                     </td>
            //                   </tr>
            //                 </tbody>
            //               </table>
            //             )}

            //             {parseFloat(checkOrderDetails.item.discount) > 0 && (
            //               <table className="table mb-0 table-borderless">
            //                 <tbody>
            //                   <tr>
            //                     <th className="fk-print-text xsm-text text-capitalize">
            //                       <span className="d-block">
            //                         {_t(t("discount"))}
            //                       </span>
            //                     </th>
            //                     <td className="fk-print-text xsm-text text-capitalize text-right">
            //                       {formatPrice(checkOrderDetails.item.discount)}
            //                     </td>
            //                   </tr>
            //                 </tbody>
            //               </table>
            //             )}
            //           </>
            //         )}

            //         {getSystemSettings(generalSettings, "sDiscount") ===
            //           "percentage" && (
            //           <>
            //             {parseFloat(checkOrderDetails.item.service_charge) >
            //               0 && (
            //               <table className="table mb-0 table-borderless">
            //                 <tbody>
            //                   <tr>
            //                     <th className="fk-print-text xsm-text text-capitalize">
            //                       <span className="d-block">
            //                         {_t(t("S.Charge"))}
            //                         {checkOrderDetails.item &&
            //                           "(" +
            //                             checkOrderDetails.item.service_charge +
            //                             "%)"}
            //                       </span>
            //                     </th>

            //                     <td className="fk-print-text xsm-text text-capitalize text-right">
            //                       {formatPrice(
            //                         checkOrderDetails.item.order_bill *
            //                           (checkOrderDetails.item.service_charge /
            //                             100)
            //                       )}
            //                     </td>
            //                   </tr>
            //                 </tbody>
            //               </table>
            //             )}

            //             {parseFloat(checkOrderDetails.item.discount) > 0 && (
            //               <table
            //                 className="table mb-0 table-borderless"
            //                 style={{ borderBottom: "1px dashed black" }}
            //               >
            //                 <tbody>
            //                   <tr>
            //                     <th className="fk-print-text xxsm-text text-capitalize">
            //                       <span className="d-block">
            //                         {_t(t("discount"))}
            //                         {checkOrderDetails.item &&
            //                           "(" +
            //                             checkOrderDetails.item.discount +
            //                             "%)"}
            //                       </span>
            //                     </th>
            //                     <td className="fk-print-text xsm-text text-capitalize text-right">
            //                       {formatPrice(
            //                         checkOrderDetails.item.order_bill *
            //                           (checkOrderDetails.item.discount / 100)
            //                       )}
            //                     </td>
            //                   </tr>
            //                 </tbody>
            //               </table>
            //             )}
            //           </>
            //         )}

            //         {/* <div className="myBorder"></div> */}
            //         <table
            //           className="table mb-0 table-borderless"
            //           style={{ borderBottom: "1px dashed black" }}
            //         >
            //           <tbody>
            //             <tr>
            //               <th className="fk-print-text md-text text-capitalize">
            //                 <span className="d-block">
            //                   {_t(t("grand total"))}
            //                 </span>
            //               </th>
            //               <td className="fk-print-text md-text text-capitalize text-right">
            //                 {formatPrice(checkOrderDetails.item.total_payable)}
            //               </td>
            //             </tr>
            //             <tr>
            //               <th className="fk-print-text md-text text-capitalize">
            //                 <span className="d-block">
            //                   {_t(t("Return Amount"))}
            //                 </span>
            //               </th>
            //               <td className="fk-print-text md-text text-capitalize text-right">
            //                 {checkOrderDetails.item.paid_amount -
            //                   checkOrderDetails.item.total_payable >
            //                 0
            //                   ? formatPrice(
            //                       parseFloat(
            //                         checkOrderDetails.item.paid_amount -
            //                           checkOrderDetails.item.total_payable
            //                       )
            //                     )
            //                   : formatPrice(0)}
            //               </td>
            //             </tr>
            //           </tbody>
            //         </table>

            //         {/* <div className="myBorder"></div> */}
            //         <p className="mb-0 md-text fk-print-text text-center text-uppercase mt-3">
            //           {getSystemSettings(generalSettings, "type_print_footer")}
            //         </p>
            //         <p className="mb-0 md-text fk-print-text text-capitalize text-center mt-2">
            //           {_t(t("bill prepared by"))}:{" "}
            //           {checkOrderDetails.item &&
            //             checkOrderDetails.item.user_name}
            //         </p>
            //       </div>
            //     </div>
            //   </div>
            // </div>
            <div
              className="content px-2 py-3 m-auto"
              style={{ width: "270px" }}
            >
              <h4
                className="text-center py-2"
                style={{
                  backgroundColor: "rgb(212, 212, 212)",
                  boxShadow: "2px 3px 0px black",
                }}
              >
                {getSystemSettings(generalSettings, "siteName")} <br />{" "}
                <span className="fs-6">
                  {checkOrderDetails.item.branch_name}
                </span>
              </h4>

              <span
                className="ms-3 px-4 mt-4"
                style={{
                  backgroundColor: "rgb(150, 150, 150)",
                  fontSize: "12px",
                }}
              >
                {checkOrderDetails.item.user_id}
              </span>
              <div className="text-center">
                <span
                  className="text-center px-1  mb-0 w-fit-content"
                  style={{
                    backgroundColor: "rgb(212, 212, 212)",
                    fontSize: "12px",
                  }}
                >
                  {checkOrderDetails.item.branch_id}
                </span>
              </div>
              <div
                className="row px-0 mx-0 mt-2"
                style={{ borderBottom: "3px solid" }}
              >
                <div className="col-6 p-0">
                  <div className="list px-2">
                    <p className="mb-1 fw-bold" style={{ fontSize: "11px" }}>
                      Date:{" "}
                      <span>
                        {
                          <Moment format="LL">
                            {checkOrderDetails.item.created_at}
                          </Moment>
                        }
                      </span>
                    </p>
                    <p className="mb-1 fw-bold" style={{ fontSize: "11px" }}>
                      Time In:{" "}
                      <span>
                        <Moment format="LT">
                          {checkOrderDetails.item.token.created_at}
                        </Moment>
                      </span>
                    </p>
                    <p className="mb-1 fw-bold" style={{ fontSize: "11px" }}>
                      Waiter: <span>{checkOrderDetails.item.waiter_name}</span>
                    </p>
                    <p className="mb-1 fw-bold" style={{ fontSize: "11px" }}>
                      Table: <span>17</span>
                    </p>
                  </div>
                </div>
                <div className="col-6 p-0">
                  <div className="list px-2">
                    <p className="mb-1 fw-bold" style={{ fontSize: "11px" }}>
                      Shift: <span>morning</span>
                    </p>
                    <p className="mb-1 fw-bold" style={{ fontSize: "11px" }}>
                      Time Out:{" "}
                      <span>
                        <Moment format="LT">
                          {checkOrderDetails.item.token.time}
                        </Moment>
                      </span>
                    </p>
                    <p className="mb-1 fw-bold" style={{ fontSize: "11px" }}>
                      Casheir: <span>{checkOrderDetails.item.waiter_name}</span>
                    </p>
                    <p className="mb-1 fw-bold" style={{ fontSize: "11px" }}>
                      GuesNo: <span>{checkOrderDetails.item.total_guest}</span>
                    </p>
                  </div>
                </div>
              </div>

              <table className="table w-100">
                <thead>
                  <tr>
                    <th className="fw-bold" style={{ fontSize: "12px" }}>
                      Qty
                    </th>
                    <th className="fw-bold" style={{ fontSize: "12px" }}>
                      Description
                    </th>
                    <th className="fw-bold" style={{ fontSize: "12px" }}>
                      Price
                    </th>
                    <th className="fw-bold" style={{ fontSize: "12px" }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {checkOrderDetails.item.orderedItems.map((item, index) => {
                    <tr key={index}>
                      <th
                        className="fw-normal p-1"
                        style={{ fontSize: "11px" }}
                      >
                        {item.quantity}
                      </th>
                      <th
                        className="fw-normal p-1"
                        style={{ fontSize: "11px" }}
                      >
                        {item.food_item}
                      </th>
                      <th
                        className="fw-normal p-1"
                        style={{ fontSize: "11px" }}
                      >
                        {item.price}
                      </th>
                      <th
                        className="fw-normal p-1"
                        style={{ fontSize: "11px" }}
                      >
                        {item.price}
                      </th>
                    </tr>;
                  })}
                </tbody>
              </table>
              <div
                className="row mx-0"
                style={{ borderTop: "3px solid", borderBottom: "3px solid" }}
              >
                <div className="col-4 p-0" style={{ borderRight: "2px solid" }}>
                  <div className="pt-3 ps-3">
                    <p className="fw-bold">DISC:</p>
                    <span>
                      {formatPrice(
                        checkOrderDetails.item.order_bill *
                          (checkOrderDetails.item.discount / 100)
                      )}
                    </span>
                  </div>
                </div>
                <div className="col-8 p-0">
                  <div className="items pt-3 ps-3 pl-3">
                    <div className="item d-flex align-items-center justify-content-between mb-1">
                      <p className="mb-0 fw-bold" style={{ fontSize: "13px" }}>
                        Sub Total
                      </p>
                      <span style={{ fontSize: "12px" }}>
                        {checkOrderDetails.item.order_bill}
                      </span>
                    </div>
                    <div className="item d-flex align-items-center justify-content-between mb-1">
                      <p className="mb-0 fw-bold" style={{ fontSize: "13px" }}>
                        Service
                      </p>
                      <span style={{ fontSize: "12px" }}>
                        {checkOrderDetails.item.service_charge}
                      </span>
                    </div>
                    <div className="item d-flex align-items-center justify-content-between mb-1">
                      <p className="mb-0 fw-bold" style={{ fontSize: "13px" }}>
                        Tax
                      </p>
                      <span style={{ fontSize: "12px" }}>12.54</span>
                    </div>
                    <div className="item d-flex align-items-center justify-content-between mb-1">
                      <p className="mb-0 fw-bold" style={{ fontSize: "13px" }}>
                        M.Ch.
                      </p>
                      <span style={{ fontSize: "12px" }}>
                        {formatPrice(
                          checkOrderDetails.item.order_bill *
                            (checkOrderDetails.item.discount / 100)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="text-center py-2"
                style={{ borderBottom: "3px solid" }}
              >
                <h4 className="fs-5 mb-1">FINAL TOTAL</h4>
                <span className="fw-bold">
                  {formatPrice(checkOrderDetails.item.total_payable)}
                </span>
              </div>
              <p
                className="text-center pt-2 fw-bold "
                style={{ fontSize: "13px" }}
              >
                Thank You, love to serve you soon
              </p>
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
                  {checkOrderDetails.item && checkOrderDetails.item.token.id}
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
                  <div className="col-12 filtr-item">
                    <div className="fk-order-token t-bg-white">
                      <div className="fk-order-token__body">
                        <div className="fk-addons-table">
                          <div className="fk-addons-table__head text-center">
                            {_t(t("order token"))}: #
                            {checkOrderDetails.item &&
                              checkOrderDetails.item.token.id}
                          </div>
                          <div className="fk-addons-table__info">
                            <div className="row g-0">
                              <div className="col-2 text-center border-right">
                                <span className="fk-addons-table__info-text text-capitalize">
                                  {_t(t("S/L"))}
                                </span>
                              </div>
                              <div className="col-3 text-center border-right">
                                <span className="fk-addons-table__info-text text-capitalize">
                                  {_t(t("food"))}
                                </span>
                              </div>
                              <div className="col-4 text-left pl-2 border-right">
                                <span className="fk-addons-table__info-text text-capitalize">
                                  {_t(t("Additional Info"))}
                                </span>
                              </div>
                              <div className="col-2 text-center border-right">
                                <span className="fk-addons-table__info-text text-capitalize">
                                  {_t(t("QTY"))}
                                </span>
                              </div>
                              <div className="col-1 text-center">
                                <span className="fk-addons-table__info-text text-capitalize">
                                  {_t(t("Status"))}
                                </span>
                              </div>
                            </div>
                          </div>
                          {checkOrderDetails.item &&
                            checkOrderDetails.item.orderedItems.map(
                              (thisItem, indexThisItem) => {
                                return (
                                  <div
                                    className="fk-addons-table__body-row"
                                    key={indexThisItem}
                                  >
                                    <div className="row g-0">
                                      <div className="col-2 text-center border-right d-flex">
                                        <span className="fk-addons-table__info-text text-capitalize m-auto">
                                          {indexThisItem + 1}
                                        </span>
                                      </div>
                                      <div className="col-3 text-center border-right d-flex">
                                        <span className="fk-addons-table__info-text text-capitalize m-auto">
                                          {thisItem.food_item} (
                                          {thisItem.food_group})
                                        </span>
                                      </div>
                                      <div className="col-4 text-center border-right t-pl-10 t-pr-10">
                                        {thisItem.variation !== null && (
                                          <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pt-5">
                                            <span className="font-weight-bold mr-1">
                                              {_t(t("variation"))}:
                                            </span>
                                            {thisItem.variation}
                                          </span>
                                        )}

                                        {thisItem.properties !== null && (
                                          <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pb-5">
                                            <span className="font-weight-bold mr-1">
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
                                      <div className="col-2 text-center border-right d-flex">
                                        <span className="fk-addons-table__info-text text-capitalize m-auto">
                                          {thisItem.quantity}
                                        </span>
                                      </div>

                                      <div className="col-1 text-center d-flex">
                                        <label className="mx-checkbox mx-checkbox--empty m-auto">
                                          <span className="mx-checkbox__text text-capitalize t-text-heading fk-addons-table__body-text">
                                            {parseInt(thisItem.is_cooking) ===
                                            1 ? (
                                              [
                                                parseInt(thisItem.is_ready) ===
                                                1 ? (
                                                  <i
                                                    className="fa fa-check text-success"
                                                    title={_t(t("Ready"))}
                                                  ></i>
                                                ) : (
                                                  <i
                                                    className="fa fa-cutlery text-secondary"
                                                    title={_t(t("Cooking"))}
                                                  ></i>
                                                ),
                                              ]
                                            ) : (
                                              <i
                                                className="fa fa-times text-primary"
                                                title={_t(t("Pending"))}
                                              ></i>
                                            )}
                                          </span>
                                        </label>
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
                      <td className="text-capitalized">
                        {_t(t("Received by"))}
                      </td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.user_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Customer"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.customer_name}
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
                      <td className="text-capitalized">
                        {_t(t("Department"))}
                      </td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.dept_tag_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Table"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.table_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Waiter"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.waiter_name}
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

                    {/* sdiscount */}
                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "flat" && (
                      <>
                        <tr>
                          <td className="text-capitalized">
                            {_t(t("Service charge"))}
                          </td>
                          <td>
                            {checkOrderDetails.item && (
                              <>
                                {currencySymbolLeft()}
                                {formatPrice(
                                  checkOrderDetails.item.service_charge
                                )}
                                {currencySymbolRight()}
                              </>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-capitalized">
                            {_t(t("Discount"))}
                          </td>
                          <td>
                            {checkOrderDetails.item && (
                              <>
                                {currencySymbolLeft()}
                                {formatPrice(checkOrderDetails.item.discount)}
                                {currencySymbolRight()}
                              </>
                            )}
                          </td>
                        </tr>
                      </>
                    )}

                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "percentage" && (
                      <>
                        <tr>
                          <td className="text-capitalized">
                            {_t(t("Service charge"))}
                            {checkOrderDetails.item &&
                              "(" +
                                checkOrderDetails.item.service_charge +
                                "%)"}
                          </td>
                          <td>
                            {checkOrderDetails.item && (
                              <>
                                {currencySymbolLeft()}
                                {formatPrice(
                                  checkOrderDetails.item.order_bill *
                                    (checkOrderDetails.item.service_charge /
                                      100)
                                )}
                                {currencySymbolRight()}
                              </>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-capitalized">
                            {_t(t("Discount"))}
                            {checkOrderDetails.item &&
                              "(" + checkOrderDetails.item.discount + "%)"}
                          </td>
                          <td>
                            {checkOrderDetails.item && (
                              <>
                                {currencySymbolLeft()}
                                {formatPrice(
                                  checkOrderDetails.item.order_bill *
                                    (checkOrderDetails.item.discount / 100)
                                )}
                                {currencySymbolRight()}
                              </>
                            )}
                          </td>
                        </tr>
                      </>
                    )}
                    {/* sDiscount */}
                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Department Commission"))}
                      </td>
                      <td>
                        {checkOrderDetails.item && (
                          <>
                            {currencySymbolLeft()}
                            {formatPrice(
                              checkOrderDetails.item.dept_commission
                            )}
                            {currencySymbolRight()}
                          </>
                        )}
                      </td>
                    </tr>

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

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Paid amount"))}
                      </td>
                      <td>
                        {checkOrderDetails.item && (
                          <>
                            {currencySymbolLeft()}
                            {formatPrice(checkOrderDetails.item.paid_amount)}
                            {currencySymbolRight()}
                          </>
                        )}
                      </td>
                    </tr>

                    {checkOrderDetails.item &&
                    parseFloat(
                      checkOrderDetails.item.total_payable -
                        checkOrderDetails.item.paid_amount
                    ) >= 0 ? (
                      <tr>
                        <td className="text-capitalized">
                          {_t(t("Due amount"))}
                        </td>
                        <td>
                          {checkOrderDetails.item && (
                            <>
                              {currencySymbolLeft()}
                              {formatPrice(
                                parseFloat(
                                  checkOrderDetails.item.total_payable -
                                    checkOrderDetails.item.paid_amount
                                )
                              )}
                              {currencySymbolRight()}
                            </>
                          )}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td className="text-capitalized">
                          {_t(t("Return amount"))}
                        </td>
                        <td>
                          {checkOrderDetails.item && (
                            <>
                              {currencySymbolLeft()}
                              {formatPrice(
                                parseFloat(
                                  checkOrderDetails.item.paid_amount -
                                    checkOrderDetails.item.total_payable
                                )
                              )}
                              {currencySymbolRight()}
                            </>
                          )}
                        </td>
                      </tr>
                    )}
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
                              ? _t(t("Order history"))
                              : _t(t("Filtered order history"))}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="col-md-4 col-lg-3">
                      <div className="input-group rounded-pill overflow-hidden">
                        <button className="btn btn-secondary" type="button">
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
                      <ul className="t-list fk-sort align-items-center justify-content-center justify-lg-content-end ">
                        <li className="fk-sort__list">
                          <NavLink
                            to="/dashboard/online-orders"
                            className="btn btn-transparent btn-secondary rounded xsm-text text-uppercase py-2"
                          >
                            {_t(t("Online Orders"))}
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
                          className={`fk-sort__list ${
                            defultLang === "ar" ? "mr-2" : "mr-0"
                          }`}
                        >
                          <button
                            className="btn btn-transparent btn-danger rounded xsm-text text-uppercase mt-2 mt-lg-0 py-2"
                            onClick={handleDateFilter}
                          >
                            {_t(t("Filter"))}
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* mobile screen  */}
                    <div className="col-md-8 col-lg-9 t-mb-15 mb-md-0 d-block d-md-none mt-3 mt-md-0">
                      <ul className="t-list fk-sort align-items-center justify-content-end">
                        <li className="fk-sort__list w-100">
                          <NavLink
                            to="/dashboard/online-orders"
                            className="btn btn-transparent btn-secondary xsm-text text-uppercase py-2"
                          >
                            {_t(t("Online Orders"))}
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
                        <li className="fk-sort__list w-100">
                          <button
                            className="btn btn-transparent btn-danger xsm-text text-uppercase py-2"
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
                                {_t(t("Time"))}
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
                                  allOrders && [
                                    allOrders.data.length === 0 ? (
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
                                      allOrders.data.map((item, index) => {
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
                                                (allOrders.meta.current_page -
                                                  1) *
                                                  allOrders.meta.per_page}
                                            </th>

                                            <td className="xsm-text text-capitalize align-middle text-center text-secondary">
                                              #{item.token.id}
                                            </td>

                                            <td className="xsm-text text-capitalize align-middle text-center">
                                              <Moment format="LT">
                                                {item.token.time}
                                              </Moment>
                                            </td>

                                            <td className="xsm-text text-capitalize align-middle text-center">
                                              <Moment format="LL">
                                                {item.created_at}
                                              </Moment>
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {item.customer_name}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {currencySymbolLeft()}
                                              {formatPrice(item.total_payable)}
                                              {currencySymbolRight()}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {item.branch_name || "-"}
                                            </td>

                                            <td className="xsm-text text-capitalize align-middle text-center">
                                              {parseInt(item.is_cancelled) ===
                                              0 ? (
                                                [
                                                  parseInt(item.is_ready) ===
                                                  0 ? (
                                                    <span
                                                      className="btn btn-transparent btn-secondary xsm-text text-capitalize"
                                                      onClick={() => {
                                                        setCheckOrderDetails({
                                                          ...checkOrderDetails,
                                                          item: item,
                                                          settle: false,
                                                        });
                                                      }}
                                                      data-toggle="modal"
                                                      data-target="#orderDetails"
                                                    >
                                                      {_t(t("processing"))}
                                                    </span>
                                                  ) : (
                                                    <span
                                                      className="btn btn-transparent btn-success xsm-text text-capitalize px-4"
                                                      onClick={() => {
                                                        setCheckOrderDetails({
                                                          ...checkOrderDetails,
                                                          item: item,
                                                          settle: false,
                                                        });
                                                      }}
                                                      data-toggle="modal"
                                                      data-target="#orderDetails"
                                                    >
                                                      {_t(t("Ready"))}
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
                                                (allOrders.meta.current_page -
                                                  1) *
                                                  allOrders.meta.per_page}
                                            </th>

                                            <td className="xsm-text text-capitalize align-middle text-center text-secondary">
                                              #{item.token.id}
                                            </td>

                                            <td className="xsm-text text-capitalize align-middle text-center">
                                              <Moment format="LT">
                                                {item.token.time}
                                              </Moment>
                                            </td>

                                            <td className="xsm-text text-capitalize align-middle text-center">
                                              <Moment format="LL">
                                                {item.created_at}
                                              </Moment>
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {item.customer_name}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {currencySymbolLeft()}
                                              {formatPrice(item.total_payable)}
                                              {currencySymbolRight()}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {item.branch_name || "-"}
                                            </td>

                                            <td className="xsm-text text-capitalize align-middle text-center">
                                              {parseInt(item.is_cancelled) ===
                                              0 ? (
                                                [
                                                  parseInt(item.is_ready) ===
                                                  0 ? (
                                                    <span
                                                      className="btn btn-transparent btn-secondary xsm-text text-capitalize"
                                                      onClick={() => {
                                                        setCheckOrderDetails({
                                                          ...checkOrderDetails,
                                                          item: item,
                                                          settle: false,
                                                        });
                                                      }}
                                                      data-toggle="modal"
                                                      data-target="#orderDetails"
                                                    >
                                                      {_t(t("processing"))}
                                                    </span>
                                                  ) : (
                                                    <span
                                                      className="btn btn-transparent btn-success xsm-text text-capitalize px-4"
                                                      onClick={() => {
                                                        setCheckOrderDetails({
                                                          ...checkOrderDetails,
                                                          item: item,
                                                          settle: false,
                                                        });
                                                      }}
                                                      data-toggle="modal"
                                                      data-target="#orderDetails"
                                                    >
                                                      {_t(t("Ready"))}
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
                            <div className="col-6 col-md-7 mb-md-0">
                              {/* pagination function */}
                              {paginationOrderHistory(
                                allOrders,
                                setPaginatedAllOrders
                              )}
                            </div>
                            <div className="col-6 col-md-5">
                              <ul className="t-list d-flex justify-content-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingDataOrderHistory(allOrders)}
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
                          <div className="col-6 col-md-7 mb-md-0">
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
                                    allOrdersForSearch
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
