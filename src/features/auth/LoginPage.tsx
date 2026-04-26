import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../shared/auth/authService';
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
      if (!response.user || response.user.role !== 'superadmin' || response.user.companyId) {
        authService.logout();
        setError('Бул платформа админ панелине кирүүгө уруксатыңыз жок');
        return;
      }

      navigate('/platform');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Кирүүдө ката кетти');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Платформа Админ
          </h1>
          <p className="text-center text-gray-600 text-sm mt-2">
            Суперадмин порталына кирүү
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
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
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
