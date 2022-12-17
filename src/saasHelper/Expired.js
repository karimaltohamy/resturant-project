import React from "react";

const Expired = () => {
  return (
    <>
      <div className="fk-global-access">
        <div className="container my-md-auto">
          <div className="row justify-content-center align-items-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="fk-global-form">
                <div className="text-center">
                  <h3 className="font-weight-normal">
                    Sorry,You have exceeded your maximum quota
                  </h3>
                  <p className="lead font-weight-normal text-capitalize">
                    To add more product please upgrade your saas package
                  </p>
                  <a
                    className="btn btn-outline-danger"
                    target="_blank"
                    href="https://thetestserver.xyz/"
                  >
                    Upgrade now
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

export default Expired;
