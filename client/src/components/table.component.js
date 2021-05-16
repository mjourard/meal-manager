/**
 * props requires header (array) and body (array of objects)
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const Table = (props) => {
    return (
        <table className={"table"}>
            <thead>
                <tr>
                    {props.headers && props.headers.map((header, index) => (
                        <th scope={"col"} key={index}>{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                    {props.body && props.body.map((row, index) => (
                        <tr key={index}>
                            {Object.keys(row).map((colKey, index) => (
                                <td key={index}>{row[colKey]}</td>
                            ))}
                        </tr>
                    ))}
            </tbody>
        </table>
    )
}

export default Table;