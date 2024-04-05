module.exports = class UserDto {
  email;
  id;
  isActivated;
  isLoggedIn;
  constructor(model) {
    this.email = model.email;
    this.isActivated = model.isActivated;
    this.id = model._id;
    this.isLoggedIn = model.isLoggedIn;
  }
};
