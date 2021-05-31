import { render, screen } from '@testing-library/svelte';
import App from '../App.svelte';

describe('App.svelte', () => {
  it('renders Hello with `name` prop', () => {
    render(App);
    expect(screen.queryByText(/focus/i)).toBeTruthy();
    expect(screen.queryByText(/enter an app/i)).toBeTruthy();
  });
});
