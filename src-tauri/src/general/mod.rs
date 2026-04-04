use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Position {
    pub x: f64,
    pub y: f64
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Size {
    pub height: usize,
    pub width: usize
}

pub fn snake_to_camel(value: String) -> String {
    value
        .chars()
        .fold((Vec::new(), false), |(mut state, mut upper), v| {
            if v == '_' {
                upper = true;
            } else {
                let push_char: char = if upper {
                    upper = false;
                    v.to_ascii_uppercase()
                } else {
                    v
                };
                state.push(push_char);
            }
            (state, upper)
        })
        .0
        .into_iter()
        .collect::<String>()
}

#[macro_export]
macro_rules! serialize_struct_camel {
    ($sturct_name:ident, $field_count:expr, $( $field_name:ident ), *) => {
        impl ::serde::Serialize for $sturct_name {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
                where
                    S: ::serde::Serializer {
                use ::serde::ser::SerializeStruct;
                let mut s = serializer.serialize_struct(stringify!($sturct_name), $field_count)?;
                $(
                    let camel_field_name: String = $crate::general::snake_to_camel(stringify!($field_name).to_string());
                    // leakメソッドによって確保したメモリを固定、&'static str化
                    <S as ::serde::Serializer>::SerializeStruct::serialize_field(&mut s, camel_field_name.leak(), &self.$field_name)?;
                )*
                s.end()
            }
        }
    };
}

#[macro_export]
macro_rules! key_match {
    ( $map:expr, $key:expr, $( $p:pat => $field:ident ),*$(,)?) => {
        match $key {
            $(
                $p => {
                    if $field.is_some() {
                        return Err(::serde::de::Error::duplicate_field(stringify!($field)));
                    }
                    $field = Some($map.next_value()?)
                },
            )*
            v => return Err(::serde::de::Error::unknown_field(v, &Self::Value::FIELDS))
        }
    };
}

#[macro_export]
macro_rules! field_check {
    ( $target_struct:ident, $( $field:ident ),* $( ; $( $default_field:ident: $default_value:expr ),* )? ) => {
        $target_struct {
            $(
                $field: $field.ok_or_else(|| ::serde::de::Error::missing_field(stringify!($field)))?,
            )*
            $($(
                $default_field: $default_value,
            )*)*
        }
    };
}

#[macro_export]
macro_rules! deserialize_struct {
    ($struct_name:ident, $visitor_name:ident, $( $field_name:ident, $field_type:ty, $field_pat:pat ), *) => {
        impl<'de> ::serde::Deserialize<'de> for $struct_name {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
                where
                    D: ::serde::Deserializer<'de> {
                deserializer.deserialize_struct(stringify!($struct_name), &$struct_name::FIELDS, $visitor_name)
            }
        }

        struct $visitor_name;

        impl<'de> ::serde::de::Visitor<'de> for $visitor_name {
            type Value = $struct_name;

            fn expecting(&self, formatter: &mut ::std::fmt::Formatter) -> ::std::fmt::Result {
                write!(formatter, "fields: {}", &$struct_name::FIELDS.join(", "))
            }

            fn visit_map<A>(self, map: A) -> Result<Self::Value, A::Error>
            where
                A: ::serde::de::MapAccess<'de>,
            {
                let mut map: A = map;
                $(
                    let mut $field_name: Option<$field_type> = None;
                )*

                while let Some(key) = map.next_key::<String>()? {
                    $crate::key_match!(
                        map,
                        key.as_str(),
                        $(
                            $field_pat => $field_name,
                        )*
                    );
                }

                Ok(
                    $crate::field_check!($struct_name, $( $field_name ),*),
                )
            }
        }
    };
}