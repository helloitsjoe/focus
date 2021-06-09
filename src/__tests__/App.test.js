import { render, screen } from '@testing-library/svelte';
import App from '../App.svelte';

describe('App.svelte', () => {
  it('renders Hello with `name` prop', () => {
    render(App);
    expect(screen.queryByText(/focus/i)).toBeTruthy();
    expect(screen.queryByText(/app name/i)).toBeTruthy();
  });

  it.todo('button is disabled until app, active and frequency are filled');
  it.todo('button is disabled if active > frequency');
  it.todo('error message if active > frequency');
  it.todo('error message if error during start');
});
