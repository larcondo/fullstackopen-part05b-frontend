import { useState, useEffect, useRef } from 'react'
// import axios from 'axios'
import noteService from './services/notes'
import loginService from './services/login'
import Footer from './components/Footer'
import Note from './components/Note'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import NoteForm from './components/NoteForm'

function App() {
  const [notes, setNotes] = useState(null)
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(false)
  const noteFormRef = useRef()

  const hook = () => {
    noteService.getAll()
      .then( initialNotes => {
        setNotes(initialNotes)
      })
  }

  useEffect(hook, [])
  // console.log('render', notes.length, 'notes');

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const addNote = (noteObject) => {
    noteFormRef.current.toggleVisibility()
    noteService.create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
      })
  }

  const toggleImportanceOf = (id) => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService.update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote))
      })
      .catch(error => {
        setErrorMessage(`the note '${note.content}' was already deleted from server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password
      })
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      )
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? 'none' : '' }
    const showWhenVisible = { display: loginVisible ? '' : 'none' }

    return(
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>log in</button>
        </div>
        <div style={showWhenVisible}>
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={ ({ target }) => setUsername(target.value) }
            handlePasswordChange={ ({ target }) => setPassword(target.value) }
            handleSubmit={handleLogin}
          />
          <button onClick={() => setLoginVisible(false)}>cancel</button>
        </div>
      </div>
    )
  }

  const noteForm = () => (
    <Togglable buttonLabel="new note" ref={noteFormRef} >
      <NoteForm createNote={addNote} />
    </Togglable>
  )

  const notesToShow = showAll ? notes : notes.filter(note => note.important)

  if (!notes) return null

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      { !user && loginForm() }
      { user && <div>
        <p>{ user.name } logged in</p>
        { noteForm() }
      </div>
      }

      <div>
        <button onClick={() => setShowAll(!showAll)}>show {showAll ? 'important' : 'all'}</button>
      </div>
      <ul>
        { notesToShow.map( note =>
          <Note key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)} />)
        }
      </ul>
      <Footer />
    </div>
  )
}

export default App