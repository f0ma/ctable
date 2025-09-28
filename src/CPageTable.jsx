/**
 * Table class.
 *
 * This class render main table. This is stateless class.
 *
 * @arg this.props.table {Object} Link to CTable instance
 * @arg this.props.width {int} Link to CTable state width
 * @arg this.props.fontSize {int} Link to CTable state fontSize
 * @arg this.props.columns {Array} Link to CTable state table_columns
 * @arg this.props.view_columns {Array} Link to CTable state view_columns
 * @arg this.props.row_status {Array} Link to CTable state table_row_status
 * @arg this.props.rows {Array} Link to CTable state table_rows
 * @arg this.props.onRowClick {function} Link to CTable action handler
 * @arg this.props.onTableXScroll {function} Link to CTable action handler
 * @arg this.props.editorShow {bool} Is any editor opened?
 *
 */

class CPageTable extends Component {

    render() {

      var self = this;

      return <section class="section  pt-0 pl-0 pr-0 pb-0">
        <div class="ctable-scroll-main-table pl-3 pr-3" style={sty("max-width", (self.props.width + 2)+"em", self.props.editorShow ? "max-height" : "", self.props.editorShow ? "16em" : "")}  onScroll={self.props.onTableXScroll}>
          <table class="ctable-main-table" style={sty("width", self.props.width+"em", "font-size", self.props.fontSize+"%")}>
            <colgroup>
              {self.props.view_columns.map(x =>{
                if (x.enabled){
                  return self.props.columns.filter(y => y.name == x.name).map(x =>
                      <col span="1" style={sty("width", x.width+"em")} />
                  )[0];
                }
              })}
            </colgroup>
            <tbody>
              {self.props.rows.map((r, i) =>
                  <tr data-rowindex={i} class={cls(self.props.row_status[i].selected ? "ctable-selected-row" : "")}>
                  {self.props.view_columns.map(x => {
                    if (x.enabled){
                      var c = self.props.columns.filter(c => c.name == x.name)[0];
                      if(c.cell_actor == "CPlainTextCell")
                          return <td onClick={self.props.onRowClick}><CPlainTextCell column={c} value={r[c.name]} row={r} /></td>;
                      if(c.cell_actor == "CSelectCell")
                          return <td onClick={self.props.onRowClick}><CSelectCell column={c} value={r[c.name]} row={r} /></td>;
                      if(c.cell_actor == "CDateCell")
                        return <td onClick={self.props.onRowClick}><CDateCell column={c} value={r[c.name]} row={r} /></td>;
                      if(c.cell_actor == "CFilesCell")
                        return <td onClick={self.props.onRowClick}><CFilesCell column={c} value={r[c.name]} row={r} onDownloadFile={self.props.table.onDownloadFile} /></td>;
                      if(c.cell_actor == "CLinkCell")
                        return <td onClick={self.props.onRowClick}><CLinkCell column={c} value={r[c.name]} row={r} options={self.props.table.state.table_options} /></td>;
                      }
                    })
                  }
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>;
    }
}
