import { useState } from "react"
import "./App.css"
import Dropdown from "./components/Dropdown"

function App() {
  const [selectedCity, setSelectedCity] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  const cities = [
    { id: 1, name: "Київ", population: "2.8M" },
    { id: 2, name: "Харків", population: "1.4M" },
    { id: 3, name: "Одеса", population: "1.0M" },
    { id: 4, name: "Дніпро", population: "980K" },
    { id: 5, name: "Львів", population: "720K" },
  ]

  const countries = [
    { id: 1, name: "Україна", code: "UA" },
    { id: 2, name: "Польща", code: "PL" },
    { id: 3, name: "Німеччина", code: "DE" },
    { id: 4, name: "Франція", code: "FR" },
  ]

  // Async search simulation
  const searchUsers = async (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = [
          { id: 1, name: "Олександр Петренко", email: "alex@example.com" },
          { id: 2, name: "Марія Іваненко", email: "maria@example.com" },
          { id: 3, name: "Дмитро Коваленко", email: "dmitro@example.com" },
          { id: 4, name: "Анна Сидоренко", email: "anna@example.com" },
        ]

        const filtered = users.filter(
          (user) =>
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase()),
        )
        resolve(filtered)
      }, 300)
    })
  }

  const renderCityItem = (item) => (
    <div className="custom-item">
      <div className="item-name">{item.name}</div>
      <div className="item-population">{item.population}</div>
    </div>
  )

  const renderSelectedCity = (item) => (
    <span>
      {item.name} ({item.population})
    </span>
  )

  const renderUserItem = (item) => (
    <div className="user-item">
      <div className="user-name">{item.name}</div>
      <div className="user-email">{item.email}</div>
    </div>
  )

  return (
    <div className="App">

      <div className="header">
        <h1>Custom Dropdown Demo</h1>
        <div className="App-header">

          <div className="demo-section">
            <h2>Базовий дропдаун з містами</h2>
            <Dropdown
              placeholder="Оберіть ваше місто"
              items={cities}
              selectedItem={selectedCity}
              onSelect={setSelectedCity}
              getItemKey={(item) => item.id}
              getItemLabel={(item) => item.name}
              renderItem={renderCityItem}
              renderSelected={renderSelectedCity}
              searchPlaceholder="Пошук міста..."
            />
          </div>

          <div className="demo-section">
            <h2>Простий дропдаун з країнами</h2>
            <Dropdown
              placeholder="Оберіть країну"
              items={countries}
              selectedItem={selectedCountry}
              onSelect={setSelectedCountry}
              getItemKey={(item) => item.id}
              getItemLabel={(item) => item.name}
              searchPlaceholder="Пошук країни..."
            />
          </div>

          <div className="demo-section">
            <h2>Асинхронний пошук користувачів</h2>
            <Dropdown
              placeholder="Знайти користувача"
              items={[]}
              selectedItem={selectedUser}
              onSelect={setSelectedUser}
              getItemKey={(item) => item.id}
              getItemLabel={(item) => item.name}
              renderItem={renderUserItem}
              searchFunction={searchUsers}
              searchPlaceholder="Введіть ім'я або email..."
              minSearchLength={2}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
