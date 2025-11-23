import React from 'react';
import styled, { keyframes } from 'styled-components';

type LoaderSize = 'small' | 'medium' | 'large';

interface LoaderProps {
  size?: LoaderSize;
  color?: string;
  fullScreen?: boolean;
  message?: string;
}

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const sizeMap = {
  small: 20,
  medium: 40,
  large: 60,
};

const FullScreenWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  z-index: 999;
`;

const InlineWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Spinner = styled.div<{ $size: number; $color: string }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border: ${({ $size }) => Math.max(2, $size / 10)}px solid #f0f0f0;
  border-top-color: ${({ $color }) => $color};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const Message = styled.p`
  margin: 16px 0 0;
  font-size: 14px;
  color: #666;
  text-align: center;
`;

export const Loader: React.FC<LoaderProps> = ({
  size = 'medium',
  color = '#007bff',
  fullScreen = false,
  message,
}) => {
  const Wrapper = fullScreen ? FullScreenWrapper : InlineWrapper;
  const spinnerSize = sizeMap[size];

  return (
    <Wrapper>
      <Spinner $size={spinnerSize} $color={color} />
      {message && <Message>{message}</Message>}
    </Wrapper>
  );
};

export default Loader;
