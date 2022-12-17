import React from "react";

const SaasApiFailure = () => {
  return (
    <>
      <div className="fk-global-access">
        <div className="container my-md-auto">
          <div className="row justify-content-center align-items-center">
            <div className="col-12 col-md-8 col-lg-6">
              <div className="fk-global-form">
                <div className="text-center">
                  <p className="lead font-weight-normal text-danger">
                    Oops, something went wrong.
                  </p>
                  <p className="lead font-weight-normal text-danger">
                    Try again later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SaasApiFailure;
