class CFilesCell extends Component {

    constructor() {
        super();

        this.onDownloadClicked = this.onDownloadClicked.bind(this);
    }

    size_to_text(n){
        if(n <= 1024){
            return N_("%d Byte","%d Bytes", n)
        } else if (n <= 1024*1024) {
            return N_("%d KiB","%d KiB", Math.round(n/1024))
        } else if (n <= 1024*1024*1024) {
            return N_("%d MiB","%d MiB", Math.round(n/1024/1024))
        }
        return N_("%d GiB","%d GiB", Math.round(n/1024/1024/1024))
    }

    onDownloadClicked(e){
        var tg = unwind_button_or_link(e);
        this.props.onDownloadFile(this.props.row, tg.dataset['column'], tg.dataset['index']);
        e.stopPropagation();
    }


    render() {
        var self = this;

        var files = [];

        if (this.props.value !== null && this.props.value !== ""){
            var mfiles = this.props.value.split(";");
            mfiles.forEach(x => {
                var w = x.split(':');
                files.push({file:w[0], size:w[1], name:w[2]});
            });
        }

        return <>{this.props.value === null ? <span class="has-text-grey">NULL</span> : files.map((x,i) => {
            return <button class="button is-small" title={x.name + " (" + self.size_to_text(x.size) + ")"} data-column={self.props.column.name} data-index={i} onClick={self.onDownloadClicked}>
              <span class="material-symbols-outlined-small">download</span>
            </button>;
        })}</>;
    }
}
