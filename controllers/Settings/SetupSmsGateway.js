const Model = require("../../model/Settings/SmsGateWay");
const asynHandler = require("../../middleware/async");
const ErrorResponse = require("../../utls/errorResponse");
exports.CreateGateway = asynHandler(async (req, res, next) => {
  const { gateway, gatewayurl, gatewaykeys, gatewaypassword, balance } =
    req.body;

  /**
   ** Check  Gateway.Update old records and set status to 1
   **/
  const Gateway = {
    gateway,
    gatewayurl,
    gatewaykeys,
    gatewaypassword,
    balance,
    status: 1,
  };
  let results = await Model.updateAll();

  if (results.affectedRows > 0 || results.affectedRows == 0) {
    const client = await Model.create(Gateway);
    if (client.affectedRows === 1) {
      return res.status(200).json({
        success: true,
        message: `Great, You Created an Gateway Successfully`,
      });
    } else {
      res.status(404).json({
        success: false,
        message:
          "Sorry we could not register this new Gateway, please try again later",
      });
    }
  }
});

exports.GetGateways = asynHandler(async (req, res, next) => {
  let results = await Model.all();
  if (results.length == 0) {
    return res.status(200).json({
      success: false,
      message: "Sorry, Failed To Retrieve Data",
      Data: [],
    });
  }
  res.json({
    Status: 1,
    Message: "Record Found",
    Data: results,
  });
});

exports.ActiveGateway = asynHandler(async (req, res, next) => {
  let results = await Model.allActive();
  if (results.length == 0) {
    return res.status(200).json({
      success: false,
      message: "Sorry, Failed To Retrieve Data",
      Data: [],
    });
  }
  res.json({
    Status: 1,
    Message: "Record Found",
    Data: results,
  });
});

exports.updateGateways = asynHandler(async (req, res, next) => {
  console.log(req.body);
  let id = req.body.id;
  const newData = {
    smtpHost: req.body.smtpHost,
    smtpPort: req.body.smtpPort,
    smtpTLS: req.body.smtpTLS,
    smtpUser: req.body.smtpUser,
    smtpPass: req.body.smtpPass,
    smtpFrom: req.body.smtpFrom,
    enabled: req.body.enabled,
  };
  let result = await Model.update(newData, id);

  if (result.affectedRows === 1) {
    res.status(200).json({
      success: true,
      message: `Record Updated`,
    });
  } else {
    res.status(401).json({ success: false, message: "Error Updating Record" });
  }
});

exports.SingleGateway = asynHandler(async (req, res, next) => {
  let id = req.body.id;
  if (!id) {
    return res.status(400).json({
      Status: 0,
      Message: `Please provide id`,
    });
  }
  let dbresult = await Model.find(id);
  if (!dbresult) {
    return res.status(200).json({
      Status: 0,
      Data: [],
      Message: `No record found`,
    });
  }

  res.json({
    Status: 1,
    Message: "Record Found",
    Data: dbresult,
  });
});

exports.RemoveSmsGateway = asynHandler(async (req, res, next) => {
  let id = req.body.id;

  if (!id) {
    return res.status(400).json({
      Status: 0,
      Message: `Please provide id`,
    });
  }
  const newData = {
    status: 0,
    deletedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
  };
  if (!id) {
    return res.status(400).json({
      Status: 0,
      Message: `Please provide an id`,
    });
  }
  let result = await Model.update(newData, id);

  if (result.affectedRows === 1) {
    res.status(200).json({
      Status: 1,
      Message: `Record Deleted`,
    });
  } else {
    res.status(500).json({ Status: 0, Message: "Error Removing Record" });
  }
});
