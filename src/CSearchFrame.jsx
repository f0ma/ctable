class CSearchFrame extends Component {

    constructor() {
        super();
    }

    render () {

        var self = this;


        var classname = CTextSearcher;

        if(self.props.column.cell_actor == "CPlainTextCell" || self.props.column.cell_actor == "CMultilineTextCell")
            classname = CTextSearcher;

        if(self.props.column.cell_actor == "CLinkCell" || self.props.column.cell_actor == "CMultiLinkCell")
            classname = CLinkSearcher;

        if(self.props.column.cell_actor == "CTagsCell" || self.props.column.cell_actor == "CSelectCell" || self.props.column.cell_actor == "CBoolCell")
            classname = CTagsSearcher;

        if(self.props.column.cell_actor == "CNumbersCell")
            classname = CNumbersSearcher;


        return <div>
            {h(classname, {index: self.props.index, column:self.props.column, table:self.props.table, operator:self.props.operator, value:self.props.value, options:self.props.table.state.table_options, onDeleteClick:self.props.onDeleteClick, onColumnChange:self.props.onColumnChange, onOperatorChange:self.props.onOperatorChange, onValueChange:self.props.onValueChange})}
        </div>;
    }

}
