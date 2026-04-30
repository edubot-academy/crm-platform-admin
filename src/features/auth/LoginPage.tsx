import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { authService } from '../../shared/auth/authService';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Input } from '../../shared/components/Input';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      // Check if user is superadmin and has no company/tenant
      if (
        !response.user ||
        response.user.role !== 'superadmin' ||
        response.user.tenantId ||
        response.user.companyId
      ) {
        void authService.logout();
        setError('Бул платформа админ панелине кирүүгө уруксатыңыз жок');
        return;
      }

      navigate('/platform');
    } catch (error) {
      setError(isAxiosError(error) ? error.response?.data?.message || 'Кирүүдө ката кетти' : 'Кирүүдө ката кетти');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-edubot-hero opacity-[0.08]" />
      <div className="absolute left-[-10%] top-[-12%] h-72 w-72 rounded-full bg-edubot-orange/15 blur-3xl" />
      <div className="absolute bottom-[-14%] right-[-8%] h-80 w-80 rounded-full bg-edubot-teal/15 blur-3xl" />
      <Card className="relative w-full max-w-md app-surface">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="dashboard-pill !border-edubot-orange/20 !bg-edubot-dark !text-white">
              Edubot Платформа
            </div>
          </div>
          <h1 className="text-center text-2xl font-bold text-edubot-dark">
            Платформа админ панели
          </h1>
          <p className="mt-2 text-center text-sm text-edubot-muted">
            Суперадмин үчүн кирүү
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="superadmin@edubot.it.com"
            />
            <Input
              label="Сырсөз"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            {error && (
              <Alert variant="error">{error}</Alert>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Кирүү...' : 'Кирүү'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
