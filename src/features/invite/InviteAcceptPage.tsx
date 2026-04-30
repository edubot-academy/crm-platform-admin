import { useState } from 'react';
import { isAxiosError } from 'axios';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import apiClient from '../../shared/api/client';

export function InviteAcceptPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const tenantId = searchParams.get('tenantId');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const labels = ['', 'Алсыз', 'Орточо', 'Жакшы', 'Күчтүү', 'Өтө күчтүү'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];
    return { score, label: labels[score], color: colors[score] };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!token) {
      setError('Чакыруу шилтемеси жараксыз');
      return;
    }
    if (!password) {
      setError('Сырсөздү киргизиңиз');
      return;
    }
    if (password.length < 8) {
      setError('Сырсөз кеминде 8 символдон турушу керек');
      return;
    }
    if (password !== confirmPassword) {
      setError('Сырсөздөр дал келбейт');
      return;
    }

    setLoading(true);

    try {
      await apiClient.post(
        '/auth/accept-invite',
        { token, password },
        tenantId ? { headers: { 'X-Company-Id': tenantId } } : undefined
      );
      setSuccess(true);
      toast.success('Сырсөз ийгиликтүү орнотулду. Кирүү үчүн аккаунтуңузга кириңиз.');
    } catch (err: unknown) {
      const errorMessage = isAxiosError(err) ? err.response?.data?.message || 'Чакырууну кабыл алууда ката кетти' : 'Чакырууну кабыл алууда ката кетти';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-edubot-hero opacity-[0.08]" />
      <div className="absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-edubot-orange/15 blur-3xl" />
      <div className="absolute bottom-[-14%] right-[-8%] h-80 w-80 rounded-full bg-edubot-teal/15 blur-3xl" />
      <div className="relative max-w-md w-full">
        <Card className="app-surface">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <div className="dashboard-pill !border-edubot-orange/20 !bg-edubot-dark !text-white">
                Edubot Чакыруу
              </div>
            </div>
            <h2 className="text-center text-2xl font-bold text-edubot-dark">Сырсөздү орнотуңуз</h2>
            <p className="mt-2 text-center text-sm text-edubot-muted">
              Чакырууну кабыл алып, каттоо эсебиңизди активдештириңиз
            </p>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-edubot-dark">Сырсөз ийгиликтүү орнотулду!</h3>
                <p className="text-sm text-edubot-muted">
                  Каттоо эсебиңиз активдештирилди. Кирүү үчүн авторизация барагына өтүңүз.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="error">{error}</Alert>
                )}

                <Input
                  label="Сырсөз"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Кеминде 8 символ"
                />
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-edubot-muted">Сырсөз күчү: {passwordStrength.label}</p>
                  </div>
                )}

                <Input
                  label="Сырсөздү тастыктоо"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Сырсөздү кайра жазыңыз"
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Сактоо...' : 'Сырсөздү орнотуу'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
