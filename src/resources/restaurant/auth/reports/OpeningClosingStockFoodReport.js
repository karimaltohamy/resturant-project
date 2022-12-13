import React, { useEffect, useContext, useState } from "react";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  pageLoading,
  paginationLoading,
  pagination,
  showingData,
  searchedShowingData,
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
import Moment from "react-moment";

//importing context consumer here
import { RestaurantContext } from "../../../../contexts/Restaurant";
import { FoodContext } from "../../../../contexts/Food";
import { NavLink, useParams } from "react-router-dom";
const OpeningClosingStockFoodReport = () => {
  const {
    //work period
    workPeriodList,
    setPaginatedWorkPeriod,
    dataPaginating,
  } = useContext(RestaurantContext);

  const {
    loading,
    setLoading,

    //food stock
    getFoodStockReport,
    itemsFood,
    setItemsFood,
    theGroupsFood,
  } = useContext(FoodContext);

  const { t } = useTranslation();
  const { started_at } = useParams();

  //new unit
  let [newWorkPeriod, setNewWorkPeriod] = useState({
    user_type: null,
    branch_id: null,
    uploading: false,
  });

  //search result
  let [searchedWorkPeriod, setSearchedWorkPeriod] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {
    getFoodStockReport(started_at);
  }, []);

  //update stock
  const handleUpdate = (e) => {
    e.preventDefault();
  };

  const handleUsage = (item) => {
    let usage = 0;
    let opening = 0;
    let closing = 0;
    let additon = 0;
    let subtraction = 0;
    if (item.opening_stock !== null && item.closing_stock !== null) {
      opening = parseFloat(item.opening_stock);
      closing = parseFloat(item.closing_stock);
    }
    if (item.addition_to_opening !== null) {
      additon = parseFloat(item.addition_to_opening);
    }
    if (item.subtraction_from_opening !== null) {
      subtraction = parseFloat(item.subtraction_from_opening);
    }

    usage = opening + additon - subtraction - closing;
    return usage;
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Food Stock"))}</title>
      </Helmet>
      <main id="main" data-simplebar>
        <div className="container">
          <div className="row t-mt-10 gx-2">
            <div className="col-12 t-mb-30 mb-lg-0">
              {newWorkPeriod.uploading === true || loading === true ? (
                pageLoading()
              ) : (
                <div className="t-bg-white ">
                  {/* next page data spin loading */}
                  <div className={`${dataPaginating && "loading"}`}></div>
                  {/* spin loading ends */}
                  <div className="row gx-2 align-itemsFood-center t-pt-15 t-pb-15 t-pl-15 t-pr-15 t-shadow">
                    <div className="col-12 t-mb-15">
                      <ul className="t-list fk-breadcrumb">
                        <li className="fk-breadcrumb__list">
                          <span className="t-link fk-breadcrumb__link text-capitalize">
                            {_t(t("Food Stock"))}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6 col-lg-5"></div>
                    <div className="col-md-6 col-lg-7 t-mb-15 mb-md-0">
                      <div className="row gx-2 align-itemsFood-center">
                        <div className="col-12 col-md-5 ml-auto mt-2 mt-md-0">
                          <ul className="t-list fk-sort align-itemsFood-center justify-content-center">
                            <li className="fk-sort__list mb-0 flex-grow-1">
                              <NavLink
                                to="/dashboard/food-stock"
                                className="w-100 btn alert-danger sm-text text-uppercase"
                              >
                                {_t(t("Go Back"))}
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="fk-scroll--order-history" data-simplebar>
                    <div className="t-pl-15 t-pr-15">
                      <form
                        className="table-responsive"
                        onSubmit={handleUpdate}
                      >
                        <table className="table table-bordered table-hover min-table-height mt-4">
                          <thead className="align-middle">
                            <tr>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("S/L"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Name"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Opening Stock"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Addition"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Subtraction"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Closing Stock"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Usage"))}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="align-middle">
                            {!searchedWorkPeriod.searched
                              ? [
                                  itemsFood &&
                                    theGroupsFood && [
                                      itemsFood.length === 0 ? (
                                        <tr className="align-middle">
                                          <td
                                            scope="row"
                                            colSpan="8"
                                            className="xsm-text align-middle text-center"
                                          >
                                            {_t(t("No data available"))}
                                          </td>
                                        </tr>
                                      ) : (
                                        theGroupsFood.map(
                                          (grpItem, grpItemIndex) => {
                                            return (
                                              <>
                                                <tr className="align-middle alert-success">
                                                  <td
                                                    scope="row"
                                                    colSpan="8"
                                                    className="xsm-text align-middle text-left ml-5 text-uppercase"
                                                  >
                                                    {grpItem.name}
                                                  </td>
                                                </tr>
                                                {itemsFood.map(
                                                  (item, index) => {
                                                    if (
                                                      parseInt(
                                                        item.ingredient_group_id
                                                      ) === grpItem.id
                                                    ) {
                                                      return (
                                                        <tr
                                                          className="align-middle"
                                                          key={index}
                                                        >
                                                          <th
                                                            scope="row"
                                                            className="xsm-text text-capitalize align-middle text-center"
                                                          >
                                                            {index + 1}
                                                          </th>

                                                          <td className="xsm-text align-middle text-center text-secondary">
                                                            {
                                                              item.ingredient_name
                                                            }
                                                          </td>

                                                          <td className="xsm-text align-middle text-center">
                                                            {item.opening_stock}
                                                          </td>

                                                          <td className="xsm-text align-middle text-center">
                                                            {item.addition_to_opening ===
                                                            null
                                                              ? 0
                                                              : item.addition_to_opening}
                                                          </td>

                                                          <td className="xsm-text align-middle text-center">
                                                            {item.subtraction_from_opening ===
                                                            null
                                                              ? 0
                                                              : item.subtraction_from_opening}
                                                          </td>

                                                          <td className="xsm-text align-middle text-center">
                                                            {item.closing_stock ||
                                                              "-"}
                                                          </td>

                                                          {item.closing_stock !==
                                                          null ? (
                                                            <td className="xsm-text align-middle text-center">
                                                              {handleUsage(
                                                                item
                                                              )}
                                                            </td>
                                                          ) : (
                                                            <td className="xsm-text align-middle text-center">
                                                              -
                                                            </td>
                                                          )}
                                                        </tr>
                                                      );
                                                    } else {
                                                      return false;
                                                    }
                                                  }
                                                )}
                                              </>
                                            );
                                          }
                                        )
                                      ),
                                    ],
                                ]
                              : ""}
                          </tbody>
                        </table>
                      </form>
                    </div>
                  </div>
                </div>
              )}
              {/* pagination loading effect */}
              {newWorkPeriod.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedWorkPeriod.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-itemsFood-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(
                                workPeriodList,
                                setPaginatedWorkPeriod
                              )}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-itemsFood-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {/* {showingData(workPeriodList)} */}
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
                        <div className="row align-itemsFood-center t-pl-15 t-pr-15">
                          <div className="col-md-7 t-mb-15 mb-md-0">
                            <ul className="t-list d-flex">
                              <li className="t-list__item no-pagination-style">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    setSearchedWorkPeriod({
                                      ...searchedWorkPeriod,
                                      searched: false,
                                    })
                                  }
                                >
                                  {_t(t("Clear Search"))}
                                </button>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-5">
                            <ul className="t-list d-flex justify-content-md-end align-itemsFood-center">
                              <li className="t-list__item">
                                <span className="d-inline-block sm-text">
                                  {/* {searchedShowingData(
                                    searchedWorkPeriod,
                                    workPeriodForSearch
                                  )} */}
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

export default OpeningClosingStockFoodReport;
