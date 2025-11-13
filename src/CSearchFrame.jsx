class CSearchFrame extends Component {

    constructor() {
        super();
    }

    render () {

        var self = this;

        return <div>
            {self.props.column.cell_actor == "CPlainTextCell" ? <CTextSearcher index={self.props.index} column={self.props.column} table={self.props.table} operator={self.props.operator} value={self.props.value} onDeleteClick={self.props.onDeleteClick} onColumnChange={self.props.onColumnChange} onOperatorChange={self.props.onOperatorChange} onValueChange={self.props.onValueChange}/> : ""}
            {self.props.column.cell_actor == "CNumbersCell" ? <CNumbersSearcher index={self.props.index} column={self.props.column} table={self.props.table} operator={self.props.operator} value={self.props.value} onDeleteClick={self.props.onDeleteClick} onColumnChange={self.props.onColumnChange} onOperatorChange={self.props.onOperatorChange} onValueChange={self.props.onValueChange}/> : ""}
            {self.props.column.cell_actor == "CTagsCell" || self.props.column.cell_actor == "CSelectCell" || self.props.column.cell_actor == "CBoolCell" ? <CTagsSearcher index={self.props.index} column={self.props.column} table={self.props.table} operator={self.props.operator} value={self.props.value} onDeleteClick={self.props.onDeleteClick} onColumnChange={self.props.onColumnChange} onOperatorChange={self.props.onOperatorChange} onValueChange={self.props.onValueChange}/> : ""}
            {self.props.column.cell_actor == "CLinkCell" || self.props.column.cell_actor == "CMultiLinkCell" ? <CLinkSearcher index={self.props.index} column={self.props.column} table={self.props.table} operator={self.props.operator} value={self.props.value} options={self.props.table.state.table_options} onDeleteClick={self.props.onDeleteClick} onColumnChange={self.props.onColumnChange} onOperatorChange={self.props.onOperatorChange} onValueChange={self.props.onValueChange}/> : ""}
        </div>;
    }

}
