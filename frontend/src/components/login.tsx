import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
	const [passwordVisible, setPasswordVisible] = useState(false)
	const [notice, setNotice] = useState('')

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setNotice('Sign-in is not connected yet. Please check back soon.')
	}

	return (
		<main className="login-shell">
			<section className="login-brand-panel" aria-label="Julia">
				<Link className="login-brand" to="/login" aria-label="Julia home">
					<img src="/logo.png" alt="" />
					<span>Julia</span>
				</Link>
				<div className="brand-message">
					<span className="brand-kicker">GET THE NEW THINGS COMMING HERE</span>
					<h1>Good to have you back.</h1>
					<p>Your conversations with Julia to know what is going on in refugee camp.</p>
				</div>
				<div className="brand-footer">
					<span className="brand-status-dot" />
					<span>Here whenever you need a moment.</span>
				</div>
				<div className="brand-lines" aria-hidden="true"><i /><i /><i /><i /><i /></div>
			</section>

			<section className="login-form-panel">
				<div className="login-form-wrap">
					<div className="login-heading">
						<span className="login-eyebrow">WELCOME BACK</span>
						<h2>Sign in to Julia</h2>
						<p>Pick up your conversation, right where you left off.</p>
					</div>

					<form className="login-form" onSubmit={handleSubmit}>
						<label htmlFor="login-email">Email address</label>
						<input
							id="login-email"
							name="email"
							type="email"
							placeholder="you@example.com"
							autoComplete="email"
							required
						/>

						<div className="login-password-label">
							<label htmlFor="login-password">Password</label>
							<button
								className="login-text-button"
								type="button"
								onClick={() => setNotice('Password recovery is not available yet.')}
							>
								Forgot password?
							</button>
						</div>
						<div className="login-password-field">
							<input
								id="login-password"
								name="password"
								type={passwordVisible ? 'text' : 'password'}
								placeholder="Enter your password"
								autoComplete="current-password"
								required
							/>
							<button
								className="login-reveal-button"
								type="button"
								aria-label={passwordVisible ? 'Hide password' : 'Show password'}
								onClick={() => setPasswordVisible((visible) => !visible)}
							>
								{passwordVisible ? 'Hide' : 'Show'}
							</button>
						</div>

						<label className="login-remember">
							<input type="checkbox" name="remember" />
							<span>Keep me signed in</span>
						</label>

						<button className="login-submit" type="submit">
							Sign in <span aria-hidden="true">&#8594;</span>
						</button>
						<p className="login-notice" role="status" aria-live="polite">{notice}</p>
					</form>

					<p className="login-signup">
						New to Julia?{' '}
						<Link className="login-text-button" to="/sign-up">Create an account</Link>
					</p>
					<p className="login-privacy">By continuing, you agree to Julia’s terms and privacy policy.</p>
				</div>
			</section>
		</main>
	)
}
