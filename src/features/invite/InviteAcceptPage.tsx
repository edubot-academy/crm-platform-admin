import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../shared/components/Button';
import { Card, CardContent, CardHeader } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import apiClient from '../../shared/api/client';

export function InviteAcceptPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
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

    const labels = ['', 'Азырк', 'Орто', 'Жакшы', 'Мыкты', 'Өтө мыкты'];
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
      await apiClient.post('/auth/accept-invite', { token, password });
      setSuccess(true);
      toast.success('Сырсөздү ийгиликтүү орнотулду. Кирүү үчүн логин кылыңыз.');
    } catch (err: any) {
      if (err.response?.status === 404) {
        const errorMessage = 'Бул функция азырынча иштебейт. Backend жөндөөсү керек.';
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage = err.response?.data?.message || 'Чакырууну кабыл алууда ката кетти';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-center text-gray-900">Сырсөздү орнотуңуз</h2>
            <p className="text-center text-sm text-gray-500 mt-2">
              Чакырууну кабыл алып, аккаунтуңузду активдештириңиз
            </p>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Сырсөздү ийгиликтүү орнотулду!</h3>
                <p className="text-sm text-gray-500">
                  Аккаунтуңуз активдештирилди. Кирүү үчүн логин баракка өтүңүз.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
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
                    <p className="text-xs text-gray-500">Сырсөз күчү: {passwordStrength.label}</p>
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
