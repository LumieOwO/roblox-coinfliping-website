import React, { useState, useEffect } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import axios, { AxiosResponse } from "axios";
import InfoBar from "./infobar/index";
import { API_URL } from "./constants";
import {
  checkAuthTokenCookie,
  connectWebSocket,
  sendWebSocketMessage,
} from "./utils";

interface AppProps {}

interface ResponseData {
  success?: boolean;
  message?: string;
  token?: string;
  headshot?: string | "";
  id?: string;
  username?: string;
  imageUrl?: string | undefined;
  robuxamount?: number;
}

interface Match {
  id: number;
  name: string;
  details?: {};
}

const App: React.FC<AppProps> = React.memo(() => {
  const [isValid, setIsValid] = useState<boolean>(false);
  const [color, setColor] = useState("red");
  const [cookie, setCookie] = useState<string>("");
  const [robuxAmnt, setRobuxAmnt] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rendered, setRendered] = useState<boolean>(false);
  const [generalAccountSettings, setGeneralAccountSettings] =
    useState<ResponseData | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  let socket: WebSocket | null = null;

  const handleColorChange = (event: any) => {
    setColor(event.target.value);
  };

  const handleSockMessage = (message: string) => {
    if (message.startsWith("69/newgame")) {
      const gameId = message.split("/")[1];
      const newMatch: Match = { id: parseInt(gameId), name: `Match ${gameId}` };
      setMatches((prevMatches) => [...prevMatches, newMatch]);
    } else if (message.startsWith("69/loadoldgames")) {
    } else if (message == "3") {
      sendWebSocketMessage("5");
    }
  };

  const handleBetAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBetAmount(parseInt(event.target.value));
  };

  useEffect(() => {
    if (rendered) return;
    socket = connectWebSocket("ws://localhost:4324", handleSockMessage);
    setRendered(true);
  }, [rendered]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      const cookie: string | false = checkAuthTokenCookie();
      if (!cookie) {
        setIsValid(false);
        setIsLoading(false);
        return;
      }

      try {
        setCookie(cookie);
        const response: AxiosResponse<ResponseData> =
          await axios.post<ResponseData>(
            `${API_URL}/auth/validauthkey`,
            {
              data: {
                cookie: cookie,
              },
            },
            {
              withCredentials: true,
            }
          );
        if (response.data.success === true) {
          setIsValid(true);
          setAvatarUrl(response.data.headshot || "");
          setRobuxAmnt(response.data.robuxamount || 0);
          setGeneralAccountSettings(response.data);
        } else {
          console.log(response.data.message);
        }
      } catch (error: any) {
        if (error.message) {
          console.error("Error:", error.message);
        } else {
          console.error("Error:", error);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!isValid) {
    return <div>Invalid user or authentication failed.</div>;
  }

  const sendMatchJoin = () => {
    sendWebSocketMessage("69/create");
  };

  return (
    <div className="app">
      <InfoBar
        robuxamnt={robuxAmnt}
        cookievalid={isValid}
        avurl={avatarUrl}
        authkey={cookie}
      />

      <div className="match-container">
        <div className="match-header">
          <Button className="btn-primary rounded-pill" onClick={sendMatchJoin}>
            Create
          </Button>
          <Form>
            <Form.Group>
              <Form.Control
                type="number"
                onChange={handleBetAmountChange}
                placeholder="Bet amount"
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                as="select"
                onChange={handleColorChange}
                value={color}
              >
                <option value="red">Green</option>
                <option value="green">Red</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </div>
        <div className="match-scroll-container">
          <div className="match-list">
            {matches.map((match) => (
              <div key={match.id} className="match-item">
                {match.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export default App;
