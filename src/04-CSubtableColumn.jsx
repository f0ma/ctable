/**
 * Action buttons column.
 *
 * @arg this.props.config {Object} Config for subtable. See props of CTable for details.
 * @arg this.props.button_hint {string} Button title for this control.
 * @arg this.props.keys[] {Object} Key list.
 * @arg this.props.keys[][0] {string} Source table column name.
 * @arg this.props.keys[][1] {string} Target table column name.
 */

class CSubtableColumn extends CTableColumn{
    constructor() {
        super();
        this.setState({opened: false});
    }

    openSubtableClicked = e => {
        this.setState({opened: !this.state.opened});
        this.props.table.open_subtable(this.props.row, this.props.keys, this.props.config);
    }

    render_header() {
        return <b>{this.title()}</b>;
    }

    render_cell() {
        return <div class="field has-addons"><div class="control"><button class={this.state.opened ? "button is-info is-inverted" : "button is-info"} title={typeof this.props.button_hint === 'undefined' ? this.props.table.props.lang.open_subtable : this.props.button_hint} onClick={this.openSubtableClicked}><span class="icon">↧</span></button></div></div>;
    }
}
