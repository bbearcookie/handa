const mongoose = require("mongoose");
const crypto = require("crypto");

// 사용자 계정 스키마
const UserSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true }, // 아이디
  hashed_password: { type: String, required: true }, // 암호화된 비밀번호
  salt: { type: String, default: "" }, // 평문의 비밀번호를 암호화하기 위해 사용할 암호화 키
  role: { type: String, default: "role_user" }, // 사용자의 역할. 일반사용자 or 관리자 등을 구분
  name: { type: String, default: "" }, // 이름
  age: { type : Number, default: 0 }, // 나이
  gender: { type : String, default: "female" }, // 성별
  allergy: { type: Array, default: [] }, // 알레르기 성분 정보. Allergy 스키마의 _id 값을 배열로 포함한다.
  myDiet: { type: Array, default: [] }, // 사용자의 내 식단 정보. 식단의 cntntsNo 값만 정수 형태로 배열로 들어가있다.
  myExercise: { type: Array, default: [] }, // 사용자의 내 운동 정보. 운동의 ExcntntsNo 값만 정수 형태로 배열로 들어가있다.
}, { timestamp: true });

// 메소드들
UserSchema.methods = {
  // 입력받은 비밀번호를 암호화한 값이 저장된 비밀번호와 일치한지 확인하는 메소드
  isValidPassword: function (password) {
    const encPassword = this.encryptPassword(password);
    if (encPassword === this.hashed_password) return true;
    return false;
  },

  // 비밀번호 암호화를 위한 난수를 만드는 메소드
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },

  // 비밀번호를 암호화하는 메소드
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
}

// User model의 가상 password 필드에 값을 저장하면 db의 salt와 hashed_password에 암호화된 값들이 들어감
UserSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

module.exports = mongoose.model("user", UserSchema);