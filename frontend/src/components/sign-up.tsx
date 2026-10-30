import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function SignUp() {
	const [passwordVisible, setPasswordVisible] = useState(false)
	const [notice, setNotice] = useState('')

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setNotice('Account creation is not connected yet. Please check back soon.')
	}

	return (
		<main className="login-shell">
			<section className="login-brand-panel" aria-label="Julia">
				<Link className="login-brand" to="/login" aria-label="Julia home">
					<img src="/logo.png" alt="" />
					<span>Julia</span>
				</Link>
				<div className="brand-message">
					<span className="brand-kicker">CONVER WITH,Julia-KAKUMA PERSONAL ASSISTANT</span>
					<h1>Make room for all, Ask about service, NGO's and Bussiness in Kakuma</h1>
					<p>What is happening in Kakuma,All refugees update and news for you</p>
				</div>
				<div className="brand-footer">
					<span className="brand-status-dot" />
					<span>Here whenever you need a moment. Trusted</span>
				</div>
				<div className="brand-lines" aria-hidden="true"><i /><i /><i /><i /><i /></div>
			</section>

			<section className="login-form-panel signup-panel">
				<div className="login-form-wrap signup-form-wrap">
					<div className="login-heading">
						<span className="login-eyebrow">GET STARTED</span>
						<h2>Create your account</h2>
						<p>A few details and you’re ready to meet Julia.</p>
					</div>

					<form className="login-form signup-form" onSubmit={handleSubmit}>
						<div className="signup-name-row">
							<div className="signup-field">
								<label htmlFor="signup-first-name">First name</label>
								<input
									id="signup-first-name"
									name="firstName"
									type="text"
									placeholder="Your first name"
									autoComplete="given-name"
									required
								/>
							</div>
							<div className="signup-field">
								<label htmlFor="signup-second-name">Second name</label>
								<input
									id="signup-second-name"
									name="secondName"
									type="text"
									placeholder="Your second name"
									autoComplete="additional-name"
									required
								/>
							</div>
						</div>

						<div className="signup-field signup-email-field">
							<label htmlFor="signup-email">Email address</label>
							<input
								id="signup-email"
								name="email"
								type="email"
								placeholder="you@example.com"
								autoComplete="email"
								required
							/>
						</div>

						<div className="signup-field">
							<label htmlFor="signup-password">Password</label>
							<div className="login-password-field">
								<input
									id="signup-password"
									name="password"
									type={passwordVisible ? 'text' : 'password'}
									placeholder="Create a password"
									autoComplete="new-password"
									minLength={8}
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
							<span className="signup-hint">Use at least 8 characters.</span>
						</div>

						<button className="login-submit signup-submit" type="submit">
							Create account <span aria-hidden="true">&#8594;</span>
						</button>
						<p className="login-notice" role="status" aria-live="polite">{notice}</p>
					</form>

					<p className="login-signup">
						Already have an account?{' '}
						<Link className="login-text-button" to="/login">Sign in</Link>
					</p>
					<p className="login-privacy">By creating an account, you agree to Julia’s terms and privacy policy.</p>
				</div>
			</section>
		</main>
	)
}
