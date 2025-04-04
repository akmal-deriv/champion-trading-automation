import { Button } from 'antd';
import './styles.scss';

interface AccountHeaderProps {
  accountType: 'Real';
  balance: string;
  currency: string;
  onDepositClick: () => void;
}

/**
 * AccountHeader: Header component displaying account information and deposit button.
 * Inputs: { accountType: 'Real', balance: string, currency: string, onDepositClick: () => void }
 * Output: JSX.Element - Header with account info and deposit button
 */
export function AccountHeader({
  accountType,
  balance,
  currency,
  onDepositClick
}: AccountHeaderProps) {
  return (
    <div className="account-header">
      <div className="account-header__info">
        <div className="account-header__type">
          {accountType}
        </div>
        <div className="account-header__balance">
          {balance} {currency}
        </div>
      </div>
      <Button 
        type="default" 
        className="account-header__deposit-btn"
        onClick={onDepositClick}
      >
        Deposit
      </Button>
    </div>
  );
}
