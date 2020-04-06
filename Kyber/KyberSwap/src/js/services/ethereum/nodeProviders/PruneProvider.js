
import BaseProvider from "./BaseProvider"

export default class PruneProvider extends BaseProvider {
    constructor(props) {
        super(props)
        this.rpcUrl = "https://testnetv3.matic.network"
        this.network = props.network
        this.initContract(this.network)
    }
}
