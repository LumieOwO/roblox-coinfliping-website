import { useState, ChangeEvent } from "react";
import axios, { AxiosResponse } from "axios";
import { Button, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { API_URL } from "../constants";

interface DepositBoxProps {
  triggerDeposit: boolean;
  authkey: string;
}

const DepositBox: React.FC<DepositBoxProps> = (props) => {
  const [value, setValue] = useState<number>(5);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const sanitizedValue = inputValue.replace(/\D/g, "");
    setValue(Number(sanitizedValue));
  };

  const onDepositClick = () => {
    if (value === undefined || value === null || value <= 0) {
      return;
    }
    axios
      .post(`${API_URL}/balance/deposit`, {
        amount: value,
        auth: props.authkey,
      })
      .then((response: AxiosResponse) => {
        if (response.data.success === false) {
        } else {
          console.log(response.data);
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  return props.triggerDeposit ? (
    <div className="box-container d-flex align-items-center justify-content-center">
      <Container>
        <div className="box">
          <input
            placeholder="Enter the amount you want to deposit"
            type="text"
            className="form-control"
            value={value}
            onChange={handleInputChange}
          />
          <div className="login-container">
            <Button variant="primary" onClick={onDepositClick}>
              Deposit
            </Button>
          </div>
        </div>
      </Container>
    </div>
  ) : null;
};

export default DepositBox;
