import { distribuirEnCarriles } from './carriles';

describe('distribuirEnCarriles', () => {
  it('una sesión sola ocupa todo el ancho', () => {
    const r = distribuirEnCarriles([{ id: 'a', inicio: 9, fin: 11 }]);
    expect(r.get('a')).toEqual({ carril: 0, carriles: 1 });
  });

  it('dos sesiones que se cruzan (14–16 y 15–17) quedan lado a lado', () => {
    const r = distribuirEnCarriles([
      { id: 'a', inicio: 14, fin: 16 },
      { id: 'b', inicio: 15, fin: 17 },
    ]);
    expect(r.get('a')).toEqual({ carril: 0, carriles: 2 });
    expect(r.get('b')).toEqual({ carril: 1, carriles: 2 });
  });

  it('sesiones seguidas sin cruce (9–11 y 11–13) usan todo el ancho', () => {
    const r = distribuirEnCarriles([
      { id: 'a', inicio: 9, fin: 11 },
      { id: 'b', inicio: 11, fin: 13 },
    ]);
    expect(r.get('a')?.carriles).toBe(1);
    expect(r.get('b')?.carriles).toBe(1);
  });
});
