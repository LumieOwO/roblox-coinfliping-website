import { useState } from "react";
import "./infobar.css";
import LoginBox from "../login/index";
import DepositBox from "../deposit/index";
import { Col, Row } from "react-bootstrap";
import {
  handleExitAccount
} from "../utils";
interface InfoBarProps {
  cookievalid: boolean;
  avurl: string | "";
  authkey: string;
  robuxamnt?: number;
}

function InfoBar(props: InfoBarProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpendep, setIsOpendep] = useState(false);
  const [isOpenlogin, setisOpenlogin] = useState<string>("Login");
  const [isOpendepstring, setIsOpendepstring] = useState<string>("Deposit");
  const handleOpenLoginUI = (): void => {
    if (isOpen == false) {
      setisOpenlogin("Close");
      setIsOpen(true);
      return;
    }
    setisOpenlogin("Login");
    setIsOpen(false);
    return;
  };



  const handleOpendepositUI = (): void => {
    if (isOpendep == false) {
      setIsOpendepstring("Close");
      setIsOpendep(true);
      return;
    }
    setIsOpendepstring("Deposit");
    setIsOpendep(false);
  };
  return props.cookievalid !== false ? (
    <header className="infobar-container">
      <div className="navbar-brand">
        <img src="src/imgs/logo.svg" alt="Logo" className="navbar-logo" />
      </div>
      <Row className="align-items-center">
        <Col xs={2}>
          <div className="avatar-profile">
            {props.avurl && (
              <div className="avatar-overlay">
                <img src={props.avurl} alt="Avatar" className="avatar-image" />
              </div>
            )}
          </div>
        </Col>
        <Col xs={2}>
          <div className="balance-text">Balance</div>
          <div className="robuxcounter">{props.robuxamnt}</div>
        </Col>
        <Col xs={3}>
          <button className="deposit-button" onClick={handleOpendepositUI}>
            {isOpendepstring}
          </button>
        </Col>
        <Col xs={3}>
          <button className="logout-button" onClick={handleExitAccount}>
            Logout
          </button>
        </Col>
      </Row>
      {isOpen && <LoginBox triggerLogin={isOpen} />}
      {isOpendep && (
        <DepositBox authkey={props.authkey} triggerDeposit={isOpendep} />
      )}
    </header>
  ) : (
    <header className="infobar-container">
      <div className="infobar">
        <button className="login-sidebar" onClick={handleOpenLoginUI}>
          {isOpenlogin}
        </button>
      </div>
      <LoginBox triggerLogin={isOpen} />
      <div className="navbar-brand">
        <img src="src/imgs/logo.svg" alt="Logo" className="navbar-logo" />
      </div>
    </header>
  );
}

export default InfoBar;
