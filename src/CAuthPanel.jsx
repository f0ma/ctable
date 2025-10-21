class CAuthPanel extends Component {

  constructor() {
    super();
  }

  render() {

    var self = this;

    return <section class="section ctable-editor-section">
      <div class="ctable-editor-panel" style={sty("width","min("+self.props.width+ "em,100%)")}>
        <div class="field has-text-right mb-4">
          <p class="control has-icons-left has-icons-right">
            <input class="input" type="text" placeholder={_("Login")}/>
            <span class="icon is-small is-left"><span class="material-symbols-outlined">Face</span></span>
          </p>
        </div>
        <div class="field">
          <p class="control has-icons-left">
            <input class="input" type="password" placeholder={_("Password")} />
            <span class="icon is-small is-left"><span class="material-symbols-outlined">Key</span></span>
          </p>
        </div>
        <div class="buttons is-centered">
          <button class="button is-primary is-soft">
            <span class="material-symbols-outlined">person</span><span>{_("Sign in")}</span>
          </button>
          <button class="button is-warning is-soft" onClick={self.props.onCloseAuth}>
            <span class="material-symbols-outlined">cancel</span><span>{_("Close")}</span>
          </button>
        </div>
      </div>
    </section>
  }
}