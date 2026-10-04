import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UploadCloud } from 'lucide-react'
import useAuth from '../../hooks/useAuth.js'
import PageHeader from '../../components/layout/PageHeader.jsx'
import { FormDatePicker, FormSelect } from '../../components/common/FormControls.jsx'
import '../../styles/users.css'

export default function UserFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { users, createUser, updateUser } = useAuth()
  const user = id ? users.find(item => item.id === id) : null
  const [error, setError] = useState('')

  const save = async event => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData)
    data.name = `${data.firstName} ${data.lastName}`.trim()
    const image = formData.get('photo')
    if (image?.size) {
      data.photo = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(image)
      })
    } else data.photo = user?.photo || ''

    if (user) updateUser(user.id, data)
    else if (users.some(item => item.email.toLowerCase() === data.email.trim().toLowerCase())) {
      setError('An account with this email already exists.')
      return
    } else createUser(data)
    navigate('/users')
  }

  if (id && !user) {
    return <div className="users-page"><PageHeader title="User not found" description="This user may have been removed." action={<Link className="users-back-link" to="/users"><ArrowLeft size={16} /> Back to users</Link>} /></div>
  }

  return (
    <div className="">
      <PageHeader
        title={user ? 'Edit User' : 'Add User'}
        description={user ? 'Update this account’s profile and access information.' : 'Create an account and set its profile and access information.'}
        action={<Link className="users-back-link" to="/users"><ArrowLeft size={16} /> Back to users</Link>}
      />
      <form className="users-form-card" onSubmit={save}>
        <header className="users-form-heading">
          <span className="users-form-kicker">User profile</span>
          <p>Fields marked required must be completed.</p>
        </header>
        <label className="users-field">
          <span>First name</span>
          <input name="firstName" autoComplete="given-name" required defaultValue={user?.firstName || user?.name?.split(' ').slice(0, -1).join(' ') || ''} />
        </label>
        <label className="users-field">
          <span>Last name</span>
          <input name="lastName" autoComplete="family-name" required defaultValue={user?.lastName || user?.name?.split(' ').slice(-1).join(' ') || ''} />
        </label>
        <fieldset className="users-gender-field">
          <legend>Gender</legend>
          <div>
            {['Female', 'Male', 'Other'].map(gender => (
              <label key={gender} className="users-gender-option">
                <input type="radio" name="gender" value={gender} required defaultChecked={user?.gender === gender} />
                <span>{gender}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="users-field">
          <span>User type</span>
          <FormSelect name="role" defaultValue={user?.role || 'Admin'}>
            <option>Admin</option><option>Inquiry</option><option>Super Admin</option>
          </FormSelect>
        </label>
        <label className="users-field">
          <span>User branch</span>
          <FormSelect name="branch" defaultValue={user?.branch || ''}>
            <option value="">Select branch</option>
            {[...new Set(['Mumbai', 'Delhi', 'Bengaluru', 'Other', user?.branch].filter(Boolean))].map(branch => <option key={branch}>{branch}</option>)}
          </FormSelect>
        </label>
        <label className="users-field users-field-wide">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required defaultValue={user?.email || ''} />
        </label>
        <label className="users-field">
          <span>Mobile</span>
          <input name="phone" type="tel" autoComplete="tel" defaultValue={user?.phone || ''} />
        </label>
        <label className="users-field">
          <span>Date of birth</span>
          <FormDatePicker name="dob" defaultValue={user?.dob || ''} />
        </label>
        <label className="users-field users-field-wide">
          <span>Address</span>
          <input name="address" autoComplete="street-address" defaultValue={user?.address || ''} />
        </label>
        <label className="users-field users-field-wide">
          <span>Profile image</span>
          <span className="users-upload-control">
            {user?.photo ? <img className="users-photo-preview" src={user.photo} alt="Current profile" /> : <UploadCloud size={18} />}
            <span>{user?.photo ? 'Choose a new image' : 'Choose an image'}</span>
            <input name="photo" type="file" accept="image/*" />
          </span>
        </label>
        {error && <p className="users-form-error" role="alert">{error}</p>}
        <div className="users-form-actions">
          <Link to="/users" className="users-cancel-link">Cancel</Link>
          <button type="submit">{user ? 'Save changes' : 'Create user'}</button>
        </div>
      </form>
    </div>
  )
}
