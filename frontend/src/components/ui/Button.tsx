import React from 'react';
import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles = {
  primary: css`
    background: #007bff;
    color: white;
    border: 2px solid #007bff;

    &:hover:not(:disabled) {
      background: #0056b3;
      border-color: #0056b3;
    }
  `,
  secondary: css`
    background: #6c757d;
    color: white;
    border: 2px solid #6c757d;

    &:hover:not(:disabled) {
      background: #545b62;
      border-color: #545b62;
    }
  `,
  outline: css`
    background: transparent;
    color: #007bff;
    border: 2px solid #007bff;

    &:hover:not(:disabled) {
      background: #007bff;
      color: white;
    }
  `,
};

const sizeStyles = {
  small: css`
    padding: 6px 12px;
    font-size: 12px;
  `,
  medium: css`
    padding: 10px 20px;
    font-size: 14px;
  `,
  large: css`
    padding: 14px 28px;
    font-size: 16px;
  `,
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
  }
`;

const Spinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  isLoading = false,
  disabled,
  children,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner />}
      {children}
    </StyledButton>
  );
};

export default Button;
