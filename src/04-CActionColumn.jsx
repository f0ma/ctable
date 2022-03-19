/**
 * Action buttons column.
 *
 * @arg this.props.no_edit {undefined|Boolean} Disable Edit button if true.
 * @arg this.props.no_delete {undefined|Boolean} Disable Delete button if true.
 * @arg this.props.no_add {undefined|Boolean} Disable Add button if true.
 * @arg this.props.no_menu {undefined|Boolean} Disable Extra menu.
 */

class CActionColumn extends CTableColumn{
    constructor() {
        super();

        this.newClicked = this.newClicked.bind(this);
        this.additionalClicked = this.additionalClicked.bind(this);
        this.menuLeave = this.menuLeave.bind(this);
        this.reloadClicked = this.reloadClicked.bind(this);
        this.editClicked = this.editClicked.bind(this);
        this.discardClicked = this.discardClicked.bind(this);
        this.saveClicked = this.saveClicked.bind(this);
        this.deleteClicked = this.deleteClicked.bind(this);

        this.setState({menu_active:false,
                       search_menu_id: makeID()
        });
    }

    newClicked(e){
        this.props.table.edit_row(-1);
    }

    additionalClicked(e){
        this.setState({menu_active: !this.state.menu_active });
    }

    menuLeave(e){
        if(e.relatedTarget !== null){
            e.relatedTarget.click();
        }
        this.setState({menu_active: false});
    }

    reloadClicked(e){
        e.preventDefault();
        this.props.table.reload();
    }

    editClicked(e){
        this.props.table.edit_row(this.props.row);
    }

    discardClicked(e){
        this.props.table.edit_row(this.props.row);
    }

    saveClicked(e){
        this.props.table.save_row(this.props.row);
    }

    deleteClicked(e){
        if(window.confirm(this.props.table.props.lang.delete_row_ask)){
            this.props.table.delete_row(this.props.row);
        }
    }

    render_header() {
        return <b>{this.title()}</b>;
    }

    render_editor() {
        return <div class="field has-addons" style="justify-content: right;"><div class="control"><button class="button is-primary" onClick={this.saveClicked}>{this.props.table.props.lang.save}</button></div><div class="control"><button class="button is-warning" onClick={this.discardClicked}>{this.props.table.props.lang.discard}</button></div></div>;
    }

    render_cell() {
        return <div class="field has-addons" style="justify-content: right;">{this.props.no_edit ? '' : <div class="control"><button class={this.props.table.state.opened_editors.includes(this.props.row) ? "button is-warning  is-inverted" : "button is-warning" } title={this.props.table.props.lang.edit_rec} onClick={this.editClicked}><span class="icon">✎</span></button></div>}{this.props.no_delete ? '' : <div class="control"><button class="button is-danger" title={this.props.table.props.lang.delete_rec} onClick={this.deleteClicked}><span class="icon">⊗</span></button></div>}</div>;
    }

    render_search() {
        return <div class={this.state.menu_active ? 'field has-addons dropdown is-right is-active' : 'field has-addons dropdown is-right'}  style="justify-content: right;">
                 {this.props.no_add ? '' :
                 <div class="control">
                   <button class={this.props.table.state.opened_editors.includes(this.props.row) ? "button is-warning is-inverted" : "button is-warning"} title={this.props.table.props.lang.add_rec} onClick={this.newClicked}><span class="icon">⊕</span></button>
                 </div>}
                 {this.props.no_menu ? '' :
                 <div class="control">
                   <button class={this.state.menu_active ? "button is-info dropdown-trigger is-inverted" : "button is-info dropdown-trigger" } title={this.props.table.props.lang.actions} aria-haspopup="true" aria-controls={this.state.search_menu_id} onClick={this.additionalClicked}  onBlur={this.menuLeave}><span class="icon">≡</span></button>
                   <div class="dropdown-menu" id={this.state.search_menu_id} role="menu">
                   <div class="dropdown-content">
                     <a href="" class="dropdown-item" onClick={this.reloadClicked}>
                       {this.props.table.props.lang.reload}
                     </a>
                   </div>
                 </div>
                 </div>}
               </div>;
    }
}
