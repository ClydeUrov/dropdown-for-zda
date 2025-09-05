import { useState, useEffect, useRef, useCallback } from "react";
import "./Dropdown.css";

let globalOpenDropdown = null;
const globalCloseCallbacks = new Set();

const Dropdown = ({
  placeholder = "Оберіть варіант",
  items = [],
  selectedItem = null,
  onSelect,
  getItemKey = (item) => item.id || item,
  getItemLabel = (item) => item.name || item.toString(),
  renderItem = null,
  renderSelected = null,
  searchFunction = null,
  searchPlaceholder = "Пошук...",
  minSearchLength = 0,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(items);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);
  const dropdownId = useRef(Math.random().toString(36).substr(2, 9));

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchQuery("");
    setFocusedIndex(-1);
    if (globalOpenDropdown === dropdownId.current) {
      globalOpenDropdown = null;
    }
  }, []);

  useEffect(() => {
    globalCloseCallbacks.add(closeDropdown);
    return () => {
      globalCloseCallbacks.delete(closeDropdown);
    };
  }, [closeDropdown]);

  const openDropdown = () => {
    if (disabled) return;

    // Close all other dropdowns
    if (globalOpenDropdown && globalOpenDropdown !== dropdownId.current) {
      globalCloseCallbacks.forEach((callback) => {
        callback();
      });
    }

    setIsOpen(true);
    globalOpenDropdown = dropdownId.current;

    // Focus search input after opening
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, closeDropdown]);

  useEffect(() => {
    const performSearch = async () => {
      if (searchFunction) {
        if (searchQuery.length >= minSearchLength) {
          setIsLoading(true);
          try {
            const results = await searchFunction(searchQuery);
            setFilteredItems(results);
          } catch (error) {
            console.error("Search error:", error);
            setFilteredItems([]);
          } finally {
            setIsLoading(false);
          }
        } else {
          setFilteredItems([]);
        }
      } else {
        const filtered = items.filter((item) =>
          getItemLabel(item).toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredItems(filtered);
      }
      setFocusedIndex(-1);
    };

    performSearch();
  }, [searchQuery, items, searchFunction, getItemLabel, minSearchLength]);


  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        closeDropdown();
        break;
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
          handleSelect(filteredItems[focusedIndex]);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex];
      if (focusedElement) {
        focusedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [focusedIndex]);

  const handleSelect = (item) => {
    onSelect(item);
    closeDropdown();
  };

  const renderSelectedValue = () => {
    if (selectedItem) {
      return renderSelected
        ? renderSelected(selectedItem)
        : getItemLabel(selectedItem);
    }
    return placeholder;
  };

  return (
    <div
      className={`dropdown ${isOpen ? "dropdown--open" : ""} ${
        disabled ? "dropdown--disabled" : ""
      }`}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
      onMouseLeave={closeDropdown}
      tabIndex={disabled ? -1 : 0}
    >
      <div
        className={`dropdown__trigger ${
          selectedItem ? "dropdown__trigger--selected" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onMouseEnter={() => {
          if (!isOpen) openDropdown();
        }}
        tabIndex={0}
      >
        <span className="dropdown__value">{renderSelectedValue()}</span>
        <span
          className={`dropdown__arrow ${isOpen ? "dropdown__arrow--up" : ""}`}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="dropdown__menu">
          <div className="dropdown__search">
            <input
              ref={searchInputRef}
              type="text"
              className="dropdown__search-input"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="dropdown__list" ref={listRef}>
            {isLoading ? (
              <div className="dropdown__loading">Завантаження...</div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={getItemKey(item)}
                  className={`dropdown__item ${
                    selectedItem &&
                    getItemKey(selectedItem) === getItemKey(item)
                      ? "dropdown__item--selected"
                      : ""
                  } ${index === focusedIndex ? "dropdown__item--focused" : ""}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setFocusedIndex(index)}
                >
                  {renderItem ? renderItem(item) : getItemLabel(item)}
                </div>
              ))
            ) : (
              <div className="dropdown__no-results">
                {searchFunction && searchQuery.length < minSearchLength
                  ? `Введіть мінімум ${minSearchLength} символів`
                  : "Нічого не знайдено"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
