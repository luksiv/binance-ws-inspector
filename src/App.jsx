import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import useWebSocket, {ReadyState} from "react-use-websocket";
import parseInput from "./parseInput";
import classnames from "classnames"
import {PaperClipIcon} from '@heroicons/react/20/solid'
import CustomSelect from "./CustomSelect";

const intervals = [
    { id: 1, value: '1s' },
    { id: 2, value: '1m' },
    { id: 3, value: '3m' },
    { id: 4, value: '5m' },
    { id: 5, value: '15m' },
    { id: 6, value: '30m' },
    { id: 7, value: '1h' },
    { id: 8, value: '2h' },
    { id: 9, value: '4h' },
    { id: 10, value: '6h' },
    { id: 11, value: '8h' },
    { id: 12, value: '12h' },
    { id: 13, value: '1d' },
    { id: 14, value: '3d' },
    { id: 15, value: '1w' },
    { id: 16, value: '1M' },
]


export default function App() {
    const [selectedInterval, setSelectedInterval] = useState(intervals[0].value)
    const [pair, setPair] = useState("MATICUSDT")

    const [socketUrl, setSocketUrl] = useState(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@kline_${selectedInterval}`)

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //
    //     }, 500)
    //     return () => {
    //         clearTimeout(timer)
    //     }
    // }, [selectedInterval, pair])

    const updateStream = () => {
        setSocketUrl(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@kline_${selectedInterval}`)
    }

    const [messageHistory, setMessageHistory] = useState([]);

    const {sendMessage, lastMessage, readyState} = useWebSocket(socketUrl);

    useEffect(() => {
        if (lastMessage !== null) {
            setMessageHistory((prev) => ([
                parseInput(lastMessage.data.toString()),
                ...prev.filter((data) => data.klineData.klineStartTime !== parseInput(lastMessage.data.toString()).klineData.klineStartTime)
            ]));
        }
    }, [lastMessage, setMessageHistory]);

    useEffect(() => {
        if (messageHistory.length > 15) {
            // trim the message history to 15 messages
            setMessageHistory((prev) => prev.slice(0, 15));
        }
    }, [messageHistory]);


    useEffect(() => {
        setMessageHistory([]);
    }, [readyState]);

    const latestMessage = messageHistory.length > 0 ? messageHistory.at(0) : null;

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Connected',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    const Col = ({children}) => (
        <th scope="col"
            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
            {children}
        </th>
    )

    const DataCell = ({children}) => (
        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
            {children}
        </td>
    )

    return (
        <main className="">
            <div className="overflow-hidden rounded-lg bg-white shadow px-4 py-8 sm:p-16 flex flex-col gap-4 sm:gap-8 sm:m-16 ">
                <div className="md:flex md:items-start md:justify-between ">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                            <span>The WebSocket is currently <span
                                className={classnames({
                                    ["text-green-600"]: readyState === ReadyState.OPEN,
                                    ["text-yellow-600"]: readyState === ReadyState.CONNECTING,
                                    ["text-red-600"]: readyState === ReadyState.CLOSED,
                                })}>{connectionStatus}</span></span>
                        </h2>
                        <h4 className="text-sm leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight break-all mt-2 sm:mt-4">
                            {socketUrl}
                        </h4>
                    </div>
                    <div className="mt-4 flex md:ml-4 md:mt-0">
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            onClick={() => setMessageHistory([])}
                        >
                            Clear history
                        </button>
                        <button
                            type="button"
                            className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            onClick={() => {
                                readyState === ReadyState.OPEN ? setSocketUrl('') : setSocketUrl('wss://stream.binance.com:443/ws/maticusdt@kline_1s');
                            }}
                        >
                            {readyState === ReadyState.OPEN ? "Disconnect" : "Connect"}
                        </button>
                    </div>
                </div>
                {
                    <table className={"w-fit"}>
                        <tbody>
                        <tr><DataCell><span
                            className={"font-bold text-black"}>Last message</span></DataCell><DataCell><span> {latestMessage && new Date(latestMessage.eventTime).toLocaleString()}</span></DataCell>
                        </tr>
                        <tr><DataCell><span className={"font-bold text-black"}>Symbol</span></DataCell><DataCell>
                            <span> {latestMessage && latestMessage.symbol}</span></DataCell></tr>
                        <tr><DataCell><span className={"font-bold text-black"}>Interval</span></DataCell><DataCell>
                            <span> {latestMessage && latestMessage.klineData.interval}</span></DataCell></tr>
                        </tbody>
                    </table>
                }
                <div className={"flex flex-col gap-4 border-t py-4"}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Symbol
                        </label>
                        <div className="mt-2">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={pair}
                                onChange={(e) => setPair(e.target.value.toLowerCase())}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                    </div>
                    <CustomSelect label={"Interval"} options={intervals} selected={selectedInterval} onChange={setSelectedInterval} />
                    <button
                        type="button"
                        onClick={() => updateStream()}
                        className="rounded-md bg-blue-50 px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-100"
                    >
                        Update stream
                    </button>
                </div>
                <div className="flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead>
                                <tr>
                                    <Col>Kline start time</Col>
                                    <Col>Kline close time</Col>
                                    <Col>Open price</Col>
                                    <Col>Close price</Col>
                                    <Col>High price</Col>
                                    <Col>Low price</Col>
                                    <Col>Base asset volume</Col>
                                    <Col>Number of trades</Col>
                                    <Col>Quote asset volume</Col>
                                    <Col>Taker buy base asset volume</Col>
                                    <Col>Taker buy quote asset volume</Col>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {messageHistory.map((message) => (
                                    <tr key={message.eventTime}>
                                        <DataCell>{new Date(message.klineData.klineStartTime).toLocaleTimeString()}</DataCell>
                                        <DataCell>{new Date(message.klineData.klineCloseTime).toLocaleTimeString()}</DataCell>
                                        <DataCell>{message.klineData.openPrice}</DataCell>
                                        <DataCell>{message.klineData.closePrice}</DataCell>
                                        <DataCell>{message.klineData.highPrice}</DataCell>
                                        <DataCell>{message.klineData.lowPrice}</DataCell>
                                        <DataCell>{message.klineData.baseAssetVolume}</DataCell>
                                        <DataCell>{message.klineData.numberOfTrades}</DataCell>
                                        <DataCell>{message.klineData.quoteAssetVolume}</DataCell>
                                        <DataCell>{message.klineData.takerBuyBaseAssetVolume}</DataCell>
                                        <DataCell>{message.klineData.takerBuyQuoteAssetVolume}</DataCell>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
