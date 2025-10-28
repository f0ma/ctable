class CAuthPanel extends Component {

  constructor() {
    super();
    this.onInputLogin = this.onInputLogin.bind(this)
    this.onInputPassword = this.onInputPassword.bind(this)
    this.onAuthentication = this.onAuthentication.bind(this)
  }

  componentDidMount() {
    this.setState({
      login: null,
      password: null
    })
  }

  onAuthentication(){
    var self = this
    if (self.state.login && self.state.password){
      self.props.onAuthLogin(self.state.login, self.state.password, true);
    }
  }

  onInputLogin(e){
    this.setState({login: e.target.value})
  }

  onInputPassword(e){
    this.setState({password: e.target.value})
  }

  render() {

    var self = this;

    return<div class="auth-layer">
      <div class="auth-box">
        <div class="field has-text-right mb-4">
          <p class="control has-icons-left has-icons-right">
            <input class="input" type="text" placeholder={_("Login")} onInput={self.onInputLogin}/>
            <span class="icon is-small is-left"><span class="material-symbols-outlined">Face</span></span>
          </p>
        </div>
        <div class="field">
          <p class="control has-icons-left">
            <input class="input" type="password" placeholder={_("Password")} onInput={self.onInputPassword}/>
            <span class="icon is-small is-left"><span class="material-symbols-outlined">Key</span></span>
          </p>
        </div>
        <div class="buttons is-centered">
          <button class="button is-primary is-soft" onClick={self.onAuthentication}>
            <span class="material-symbols-outlined">person</span><span>{_("Sign in")}</span>
          </button>
          <button class="button is-warning is-soft" onClick={self.props.onCloseAuth}>
            <span class="material-symbols-outlined">cancel</span><span>{_("Close")}</span>
          </button>
        </div>
      </div>
    </div>
  }
}