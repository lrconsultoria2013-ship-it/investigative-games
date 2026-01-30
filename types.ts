import React from 'react';

export interface User {
  email: string;
  name: string;
}

export type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

export interface LoginError {
  field?: 'email' | 'password';
  message: string;
}

export type CaseStatus = 'editing' | 'ready_to_print' | 'distributed';

export interface Case {
  id: string;
  title: string;
  theme: string;
  status: CaseStatus;
  created_at: string;
  copies_sold: number;
}

export interface Metric {
  label: string;
  value: string | number;
  trend: number; // percentage
  trendDirection: 'up' | 'down';
  icon?: React.ReactNode;
}