class CSearchFrame extends Component {

    constructor() {
        super();
    }

    render () {

        var self = this;

        return <div>
            {self.props.column.cell_actor == "CPlainTextCell" ? <CTextSearcher index={self.props.index} column={self.props.column} table={self.props.table} operator={self.props.operator} value={self.props.value} onDeleteClick={self.props.onDeleteClick} onColumnChange={self.props.onColumnChange} onOperatorChange={self.props.onOperatorChange} onValueChange={self.props.onValueChange}/> : ""}
            {self.props.column.editor_hint ? <p class="help">{self.props.column.editor_hint}</p> : <p class="help mt-4">{self.props.column.editor_hint}</p>}
        </div>;
    }

}
