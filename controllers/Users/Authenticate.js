const USERS = require("../../model/User/UserModel");
const LdapModel = require("../../model/Settings/LdapSettings");

const bcyrpt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const asynHandler = require("../../middleware/async");
const ErrorResponse = require("../../utls/errorResponse");
dotenv.config({ path: "./config/config.env" });
exports.AuthUser = asynHandler(async (req, res, next) => {
  const { username, password } = req.body;
  let mailformat =
    /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (mailformat.test(username)) {
    /**
     * Check if username is email address
     * proceed to check if ldap settings are available
     */
    console.log("match");
    let checkldap = await LdapModel.FinEnabledLdap();
    if (!checkldap) {
      return res.status(400).json({
        success: false,
        message: `Sorry,No Ldap settings has been configured`,
      });
    }
    /**
     * Check if email exist
     *
     */

    let verifyEmailInSystem = await USERS.AuthenticateEmail(username);

    if (!verifyEmailInSystem) {
      return next(new ErrorResponse(`Invalid Username or Password`, 401));
    }
    /**
     * Check if ldap domain exist
     *
     */
    let maindomain = checkldap.ldap_domain;
    let userDomain = username.split("@").pop();
    if (userDomain !== maindomain) {
      return res.status(400).json({
        success: false,
        message: `Sorry,Domain name does not exist`,
      });
    }

    res.send("Welcome Ldap User...");
  } else {
    /**
     * Local authentication
     */
    console.log("not match");

    /**
     * Check username
     */

    let results = await USERS.Authenticate(username);

    if (!results) {
      return next(new ErrorResponse(`Invalid Username or Password`, 401));
    }

    /**
     * Check password
     */

    const isMatch = await bcyrpt.compare(password, results.password);
    if (!isMatch) {
      return next(new ErrorResponse(`Invalid Username or Password`, 401));
    }

    /**
     *---->get token details from db
     ***create Token payload
     */
    // dbtoken
    let dbtoken = await USERS.Token();
    let issuer = dbtoken.issuer;
    let audience = dbtoken.audience;
    let timetolive = dbtoken.timetolive;
    let token_name = dbtoken.token_name;

    sendTokenResponse(
      username,
      200,
      issuer,
      audience,
      timetolive,
      token_name,
      res
    );
  }
});

const sendTokenResponse = (
  username,
  statusCode,
  issuer,
  audience,
  timetolive,
  token_name,
  res
) => {
  const payload = {
    sub: username,
    iss: issuer,
    aud: audience,
  };
  const token = jwt.sign(payload, process.env.jwtPrivateKey, {
    expiresIn: timetolive,
  });

  const options = {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie(token_name, token, options)
    .json({ success: true, message: "Logged in successfully" });
};
