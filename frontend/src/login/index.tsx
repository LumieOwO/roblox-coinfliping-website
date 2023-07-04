import { useState, ChangeEvent } from "react";
import axios, { AxiosResponse } from "axios";
import { API_URL } from "../constants";
import { Form, Button } from "react-bootstrap";

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

interface LoginBoxProps {
  triggerLogin: boolean;
}

const LoginBox: React.FC<LoginBoxProps> = (props) => {
  const [cookie, setCookie] = useState<string>("");

  const handleCookieChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setCookie(event.target.value);
  };

  const registerToRobloxAcc = async (): Promise<void> => {
    try {
      const response: AxiosResponse<ResponseData> =
        await axios.post<ResponseData>(
          `${API_URL}/auth/cookie`,
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
        const token: string | undefined = response.data.token;
        const date: Date = new Date();
        date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expires: string = date.toUTCString();
        document.cookie = `AuthToken=${token}; expires=${expires}`;
        window.location.reload();
      } else {
        console.log(response.data.success);
      }
    } catch (error: any) {
      console.error("Error:", error.message);
    }
  };

  return props.triggerLogin ? (
    <div className="d-flex justify-content-center align-items-center">
      <div className="box">
        <Form>
          <Form.Group controlId="cookieInput">
            <Form.Control
              type="text"
              placeholder="Enter your .ROBLOSECURITY cookie"
              value={cookie}
              onChange={handleCookieChange}
              className="cookie-input"
            />
          </Form.Group>
          <div className="login-container">
            <Button variant="primary" onClick={registerToRobloxAcc}>
              Sign in
            </Button>
          </div>
        </Form>
      </div>
    </div>
  ) : null;
};

export default LoginBox;
