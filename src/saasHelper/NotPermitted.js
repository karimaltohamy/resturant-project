import React from "react";

const NotPermitted = () => {
  return (
    <>
      <div className="fk-global-access">
        <div className="d-none d-lg-block">
          <div className="fk-global-img text-center">
            <img
              src="/assets/img/sign-in.png"
              alt="khadyo"
              className="img-fluid mx-auto fk-global-img__is"
            />
            <img
              src="/assets/img/obj-1.png"
              alt="khadyo"
              className="img-fluid fk-global-img__obj fk-global-img__obj-1"
            />
            <img
              src="/assets/img/obj-8.png"
              alt="khadyo"
              className="img-fluid fk-global-img__obj fk-global-img__obj-2"
            />
            <img
              src="/assets/img/obj-7.png"
              alt="khadyo"
              className="img-fluid fk-global-img__obj fk-global-img__obj-6"
            />
            <img
              src="/assets/img/obj-9.png"
              alt="khadyo"
              className="img-fluid fk-global-img__obj fk-global-img__obj-8"
            />
          </div>
        </div>
        <div className="container my-md-auto">
          <div className="row">
            <div className="col-md-8 col-lg-6 col-xl-4 t-mt-50">
              <div className="fk-global-form">
                <div>
                  <h3 className="font-weight-normal">
                    Your subscription has expired
                  </h3>
                  <p className="lead font-weight-normal">
                    Please renew to perform the requested action.
                  </p>
                  <a
                    className="btn btn-outline-danger"
                    target="_blank"
                    href="https://test.thetestserver.xyz/"
                  >
                    Renew subscription
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotPermitted;
